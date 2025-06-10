from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Survey, SurveyInstance, Participation, Question, Answer, Option, AnswerOption, User
from ..serializers import SurveySerializer, SurveyInstanceSerializer, SurveyInstanceDetailSerializer, QuestionDetailSerializer, QuestionSerializer, ParticipationSerializer
from django.db import transaction
from django.utils import timezone
from .auth_views import IsClient

class SurveyInstanceViewSet(viewsets.ModelViewSet):
    serializer_class = SurveyInstanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role.name == 'admin' or user.is_staff:
            return SurveyInstance.objects.all()
        else:
            return SurveyInstance.objects.filter(survey__client=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return SurveyInstanceDetailSerializer
        return SurveyInstanceSerializer
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Obtener estadísticas avanzadas de la instancia incluyendo respuestas por opción"""
        instance = self.get_object()
        
        total_participations = instance.participations.count()
        completed_participations = instance.participations.filter(state='completed').count()
        in_progress_participations = instance.participations.filter(state='in_progress').count()
        
        completion_rate = 0
        if total_participations > 0:
            completion_rate = (completed_participations / total_participations) * 100
        
        questions_stats = []
        for question in instance.survey.questions.all():
            answers_count = Answer.objects.filter(
                participation__instance=instance,
                question=question
            ).count()
            
            question_stat = {
                'question_id': question.id,
                'question_content': question.content,
                'question_type': question.type,
                'answers_count': answers_count,
                'options_stats': []
            }
            
            # Estadísticas por opción para preguntas de opción múltiple
            if question.type in ['single_choice', 'multiple_choice']:
                for option in question.options.all():
                    # Contar cuántas veces se seleccionó esta opción
                    option_selections = AnswerOption.objects.filter(
                        answer__participation__instance=instance,
                        option=option
                    ).count()
                    
                    # Calcular porcentaje
                    percentage = 0
                    if completed_participations > 0:
                        percentage = (option_selections / completed_participations) * 100
                    
                    question_stat['options_stats'].append({
                        'option_id': option.id,
                        'option_content': option.content,
                        'selections_count': option_selections,
                        'percentage': round(percentage, 2)
                    })
            
            # Para preguntas abiertas, mostrar una muestra de respuestas
            elif question.type == 'open':
                sample_answers = Answer.objects.filter(
                    participation__instance=instance,
                    question=question,
                    content__isnull=False
                ).exclude(content='').values_list('content', flat=True)[:5]
                
                question_stat['sample_answers'] = list(sample_answers)
            
            questions_stats.append(question_stat)
        
        return Response({
            'total_participations': total_participations,
            'completed_participations': completed_participations,
            'in_progress_participations': in_progress_participations,
            'completion_rate': round(completion_rate, 2),
            'creation_date': instance.creation_date,
            'closure_date': instance.closure_date,
            'state': instance.state,
            'questions_statistics': questions_stats
        })
    
    @action(detail=True, methods=['get'])
    def public_url(self, request, pk=None):
        """Obtener URL pública de la encuesta"""
        instance = self.get_object()
        
        base_url = request.build_absolute_uri('/')[:-1]
        public_url = f"{base_url}/cuestamarket/surveys/{instance.id}/"
        
        return Response({
            'public_url': public_url,
            'embed_code': f'<iframe src="{public_url}" width="100%" height="600" frameborder="0"></iframe>',
            'state': instance.state,
            'is_active': instance.state == 'open'
        })
    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='public/open')
    def public_open_instances(self, request):
        """Endpoint público: listar instancias de encuesta abiertas"""
        now = timezone.now()
        open_instances = SurveyInstance.objects.filter(
            closure_date__isnull=False,
            closure_date__gt=now
        )
        serializer = self.get_serializer(open_instances, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-survey/(?P<survey_id>[^/.]+)')
    def by_survey(self, request, survey_id=None):
        user = request.user
        if user.role.name == 'admin' or user.is_staff:
            instances = SurveyInstance.objects.filter(survey_id=survey_id)
        else:
            instances = SurveyInstance.objects.filter(survey__client=user, survey_id=survey_id)
        serializer = self.get_serializer(instances, many=True)
        return Response(serializer.data)

class SurveySubmissionAPIView(APIView):
    """API para enviar respuestas de encuesta con manejo completo de AnswerOption"""
    
    def post(self, request, instance_id):
        try:
            instance = get_object_or_404(SurveyInstance, id=instance_id)
            
            if instance.state != 'open':
                return Response({
                    'error': 'Survey not available',
                    'message': 'Esta encuesta no está disponible.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Verificar participación existente
            if request.user.is_authenticated:
                existing_participation = Participation.objects.filter(
                    user=request.user,
                    instance=instance,
                    state='completed'
                ).first()
                
                if existing_participation:
                    return Response({
                        'error': 'Already participated',
                        'message': 'Ya has participado en esta encuesta.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            answers = request.data.get('answers', [])
            
            if not answers:
                return Response({
                    'error': 'No answers provided',
                    'message': 'No se han proporcionado respuestas.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                # Crear participación
                participation = Participation.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    instance=instance,
                    state='in_progress'
                )
                
                # Procesar respuestas
                for answer_data in answers:
                    question_id = answer_data.get('question_id')
                    question = instance.survey.questions.filter(id=question_id).first()
                    
                    if not question:
                        continue
                    
                    # Crear la respuesta base
                    answer = Answer.objects.create(
                        participation=participation,
                        question=question
                    )
                    
                    # Manejar según tipo de pregunta
                    if question.type == 'single_choice':
                        selected_option_id = answer_data.get('selected_option')
                        if selected_option_id:
                            option = question.options.filter(id=selected_option_id).first()
                            if option:
                                AnswerOption.objects.create(
                                    answer=answer,
                                    option=option
                                )
                    
                    elif question.type == 'multiple_choice':
                        selected_option_ids = answer_data.get('selected_options', [])
                        for option_id in selected_option_ids:
                            option = question.options.filter(id=option_id).first()
                            if option:
                                AnswerOption.objects.create(
                                    answer=answer,
                                    option=option
                                )
                    
                    elif question.type == 'open':
                        text_content = answer_data.get('content', '').strip()
                        if text_content:
                            answer.content = text_content
                            answer.save()
                
                # Marcar como completada
                participation.state = 'completed'
                participation.save()
            
            return Response({
                'success': True,
                'message': 'Respuestas enviadas correctamente.',
                'participation_id': participation.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'message': 'Error al procesar las respuestas.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_survey_data(request, instance_id):
    """API endpoint para obtener datos de la encuesta"""
    try:
        instance = get_object_or_404(SurveyInstance, id=instance_id)
        
        if instance.state != 'open':
            return Response({
                'error': 'Survey not available',
                'message': 'Esta encuesta no está disponible en este momento.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        questions = instance.survey.questions.all().order_by('order')
        questions_data = QuestionDetailSerializer(questions, many=True).data
        
        # Verificar participación existente
        user_participation = None
        if request.user.is_authenticated:
            user_participation = Participation.objects.filter(
                user=request.user,
                instance=instance
            ).first()
        
        survey_data = {
            'instance': {
                'id': instance.id,
                'title': instance.survey.title,
                'description': instance.survey.description,
                'state': instance.state,
                'creation_date': instance.creation_date
            },
            'questions': questions_data,
            'user_participation': {
                'id': user_participation.id if user_participation else None,
                'state': user_participation.state if user_participation else None,
                'can_participate': user_participation is None or user_participation.state != 'completed'
            } if request.user.is_authenticated else {'can_participate': True}
        }
        
        return Response(survey_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Survey not found',
            'message': str(e)
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_survey(request, instance_id):
    """API endpoint mejorado para enviar respuestas con manejo completo de AnswerOption"""
    try:
        instance = get_object_or_404(SurveyInstance, id=instance_id)
        
        if instance.state != 'open':
            return Response({
                'error': 'Survey not available',
                'message': 'Esta encuesta no está disponible para responder.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        answers_data = request.data.get('answers', [])
        if not answers_data:
            return Response({
                'error': 'No answers provided',
                'message': 'No se proporcionaron respuestas.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Crear o verificar participación
            if request.user.is_authenticated:
                # Verificar si ya completó la encuesta
                existing_completed = Participation.objects.filter(
                    user=request.user,
                    instance=instance,
                    state='completed'
                ).exists()
                
                if existing_completed:
                    return Response({
                        'error': 'Already completed',
                        'message': 'Ya has completado esta encuesta.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Obtener o crear participación
                participation, created = Participation.objects.get_or_create(
                    user=request.user,
                    instance=instance,
                    defaults={'state': 'in_progress'}
                )
                
                # Limpiar respuestas anteriores si es una reedición
                if not created:
                    Answer.objects.filter(participation=participation).delete()
            else:
                # Participación anónima
                participation = Participation.objects.create(
                    user=None,
                    instance=instance,
                    state='in_progress'
                )
            
            # Procesar respuestas
            for answer_data in answers_data:
                question_id = answer_data.get('question_id')
                
                if not question_id:
                    print(f"⚠️ Pregunta no encontrada antes: id={question_id} para encuesta {instance.id}")
                    continue
                
                try:
                    question = Question.objects.get(id=question_id, survey=instance.survey)
                    print(f"✅ Procesando pregunta {question.id} de tipo '{question.type}'")
                except Question.DoesNotExist:
                    print(f"⚠️ Pregunta no encontrada: id={question_id} para encuesta {instance.id}")
                    continue
                
                # Crear respuesta base
                answer = Answer.objects.create(
                    participation=participation,
                    question=question
                )
                print(f"✅ Answer creado con ID: {answer.id}")
                
                # Manejar diferentes tipos de respuesta
                if question.type == 'single':
                    option_id = answer_data.get('option_id')
                    if option_id is None:
                        option_id = answer_data.get('selectedOption')

                    if option_id:
                        try:
                            option = Option.objects.get(id=option_id, question=question)
                            answer.option = option
                            answer.save()
                            print(f"✅ Opción única guardada: {option.id}")
                        except Option.DoesNotExist:
                            print(f"⚠️ Opción única no encontrada: id={option_id} para pregunta {question.id}")
                
                elif question.type == 'multiple':
                    option_ids = answer_data.get('option_ids')
                    if option_ids is None:
                        option_ids = answer_data.get('selectedOptions') or []
                    
                    print(f"🔍 Procesando opciones múltiples: {option_ids}")
                    
                    # Verificar que option_ids es una lista
                    if not isinstance(option_ids, list):
                        print(f"⚠️ option_ids no es una lista: {type(option_ids)} - {option_ids}")
                        continue
                    
                    # Obtener todas las opciones válidas para esta pregunta
                    valid_options = Option.objects.filter(question=question)
                    valid_option_ids = list(valid_options.values_list('id', flat=True))
                    print(f"🔍 Opciones válidas para pregunta {question.id}: {valid_option_ids}")
                    
                    created_count = 0
                    for option_id in option_ids:
                        try:
                            # Asegurarse de que la opción pertenece a esta pregunta
                            option = Option.objects.get(id=option_id, question=question)
                            answer_option = AnswerOption.objects.create(answer=answer, option=option)
                            created_count += 1
                            print(f"✅ AnswerOption creado: answer={answer.id}, option={option.id}, answer_option_id={answer_option.id}")
                        except Option.DoesNotExist:
                            print(f"⚠️ Opción múltiple no encontrada: id={option_id} para pregunta {question.id}")
                            print(f"Opciones válidas: {valid_option_ids}")
                        except Exception as e:
                            print(f"❌ Error creando AnswerOption: {str(e)}")
                    
                    print(f"✅ Total AnswerOption creados para pregunta {question.id}: {created_count}")
                
                elif question.type in ['open', 'text', 'textarea']:
                    content = answer_data.get('content', '').strip()
                    if content:
                        answer.content = content
                        answer.save()
                        print(f"✅ Contenido de texto guardado para pregunta {question.id}")
            
            # Marcar participación como completada
            participation.state = 'completed'
            participation.save()
            print(f"✅ Participación {participation.id} marcada como completada")
        
        return Response({
            'success': True,
            'message': 'Respuestas guardadas correctamente.',
            'participation_id': participation.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"❌ Error general en submit_survey: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Submission failed',
            'message': f'Error al guardar respuestas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def survey_stats(request, instance_id):
    """Obtener estadísticas básicas de la encuesta"""
    try:
        instance = get_object_or_404(SurveyInstance, id=instance_id)
        
        stats = {
            'total_participations': instance.participations.count(),
            'completed_participations': instance.participations.filter(state='completed').count(),
            'creation_date': instance.creation_date,
            'is_active': instance.state == 'open',
            'total_questions': instance.survey.questions.count()
        }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Stats not available',
            'message': str(e)
        }, status=status.HTTP_404_NOT_FOUND)