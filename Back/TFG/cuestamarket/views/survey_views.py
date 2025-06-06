from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Survey, SurveyInstance, Participation, Question, Answer, Option, AnswerOption
from ..serializers import SurveySerializer, SurveyInstanceSerializer, SurveyInstanceDetailSerializer, QuestionDetailSerializer, QuestionSerializer, ParticipationSerializer
from django.db import transaction
from django.utils import timezone
from .auth_views import IsClient

class SurveyViewSet(viewsets.ModelViewSet):
    """
    Viewset for Survey model

    This viewset is responsible for handling CRUD operations on Survey model
    instances. It is only accessible by authenticated users and they can
    only see their own created surveys.

    Attributes:
        queryset (QuerySet): The queryset for the viewset. It is a QuerySet
            of all Survey instances.
        serializer_class (Serializer): The serializer for the viewset. It is
            SurveySerializer.
        permission_classes (list): The list of permissions required to access
            this viewset. It requires the user to be authenticated and to be
            a client, an admin or staff.
    """
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = [IsAuthenticated, IsClient]

    def get_queryset(self):
        # Show only surveys created by the authenticated user
        return self.queryset.filter(client=self.request.user)

class SurveyInstanceViewSet(viewsets.ModelViewSet):
    serializer_class = SurveyInstanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Solo las instancias de encuestas del cliente actual
        return SurveyInstance.objects.filter(survey__client=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return SurveyInstanceDetailSerializer
        return SurveyInstanceSerializer
    
    @action(detail=True, methods=['get'])
    def configuration(self, request, pk=None):
        """Obtener configuración completa de la instancia"""
        instance = self.get_object()
        serializer = SurveyInstanceDetailSerializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicar una instancia de encuesta"""
        original_instance = self.get_object()
        
        with transaction.atomic():
            new_instance = SurveyInstance.objects.create(
                survey=original_instance.survey,
                state='open'
            )
        
        serializer = SurveyInstanceDetailSerializer(new_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'])
    def update_state(self, request, pk=None):
        """Actualizar estado de la instancia"""
        instance = self.get_object()
        new_state = request.data.get('state')
        
        valid_states = ['open', 'closed', 'draft']
        if new_state not in valid_states:
            return Response(
                {'error': 'Estado inválido. Estados válidos: open, closed, draft'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        

        if new_state == 'closed' and instance.state != 'closed':
            instance.closure_date = timezone.now()
        elif new_state != 'closed':
            instance.closure_date = None
            
        instance.state = new_state
        instance.save()
        
        serializer = SurveyInstanceDetailSerializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Cerrar instancia de encuesta"""
        instance = self.get_object()
        
        if instance.state == 'closed':
            return Response(
                {'message': 'La instancia ya está cerrada'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.state = 'closed'
        instance.closure_date = timezone.now()
        instance.save()
        
        return Response({
            'message': 'Instancia cerrada correctamente',
            'closure_date': instance.closure_date,
            'state': instance.state
        })
    
    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """Reabrir instancia de encuesta"""
        instance = self.get_object()
        
        if instance.state != 'closed':
            return Response(
                {'message': 'Solo se pueden reabrir instancias cerradas'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.state = 'open'
        instance.closure_date = None
        instance.save()
        
        return Response({
            'message': 'Instancia reabierta correctamente',
            'state': instance.state
        })
    
    @action(detail=True, methods=['get'])
    def public_url(self, request, pk=None):
        """Obtener URL pública de la encuesta"""
        instance = self.get_object()
        
        base_url = request.build_absolute_uri('/')[:-1]
        public_url = f"{base_url}/survey/{instance.id}/"
        
        return Response({
            'public_url': public_url,
            'embed_code': f'<iframe src="{public_url}" width="100%" height="600" frameborder="0"></iframe>',
            'state': instance.state,
            'is_active': instance.state == 'open'
        })
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Obtener estadísticas básicas de la instancia"""
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
            
            questions_stats.append({
                'question_id': question.id,
                'question_content': question.content,
                'question_type': question.type,
                'answers_count': answers_count
            })
        
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
    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='public/open')
    def public_open_instances(self, request):
        """Endpoint público: listar instancias de encuesta abiertas"""
        open_instances = SurveyInstance.objects.filter(state='open')
        serializer = self.get_serializer(open_instances, many=True)
        return Response(serializer.data)

class SurveyConfigurationViewSet(viewsets.ViewSet):
    """ViewSet para configuraciones avanzadas de encuestas"""
    permission_classes = [IsAuthenticated]
    
    def get_survey_instance(self, instance_id):
        return get_object_or_404(
            SurveyInstance, 
            id=instance_id, 
            survey__client=self.request.user
        )
    
    @action(detail=False, methods=['get'], url_path='(?P<instance_id>[^/.]+)/questions')
    def list_questions(self, request, instance_id=None):
        """Listar preguntas de la instancia con sus opciones"""
        instance = self.get_survey_instance(instance_id)
        questions = instance.survey.questions.all()
        serializer = QuestionDetailSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='(?P<instance_id>[^/.]+)/participations')
    def list_participations(self, request, instance_id=None):
        """Listar participaciones de la instancia"""
        instance = self.get_survey_instance(instance_id)
        participations = instance.participations.all().order_by('-date')
        
        # Paginación
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_participations = participations[start:end]
        serializer = ParticipationSerializer(paginated_participations, many=True)
        
        return Response({
            'results': serializer.data,
            'total': participations.count(),
            'page': page,
            'page_size': page_size,
            'has_next': end < participations.count()
        })
    
    @action(detail=False, methods=['get'], url_path='(?P<instance_id>[^/.]+)/export-data')
    def export_data(self, request, instance_id=None):
        """Exportar datos de respuestas (preparación para CSV/Excel)"""
        instance = self.get_survey_instance(instance_id)
        
        export_data = []
        participations = instance.participations.filter(state='completed')
        
        for participation in participations:
            row = {
                'usuario': participation.user.username if participation.user else 'Anónimo',
                'fecha_participacion': participation.date.strftime('%Y-%m-%d %H:%M:%S'),
                'estado': participation.state
            }
            
            for question in instance.survey.questions.all():
                answer = Answer.objects.filter(
                    participation=participation,
                    question=question
                ).first()
                
                if answer:
                    if answer.option:
                        row[f'pregunta_{question.id}'] = answer.option.content
                    elif answer.content:
                        row[f'pregunta_{question.id}'] = answer.content
                    else:
                        row[f'pregunta_{question.id}'] = 'Sin respuesta'
                else:
                    row[f'pregunta_{question.id}'] = 'Sin respuesta'
            
            export_data.append(row)
        
        return Response({
            'data': export_data,
            'headers': list(export_data[0].keys()) if export_data else [],
            'total_responses': len(export_data),
            'survey_title': instance.survey.title,
            'export_date': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    
    @action(detail=False, methods=['delete'], url_path='(?P<instance_id>[^/.]+)/participations/(?P<participation_id>[^/.]+)')
    def delete_participation(self, request, instance_id=None, participation_id=None):
        """Eliminar una participación específica"""
        instance = self.get_survey_instance(instance_id)
        participation = get_object_or_404(
            Participation, 
            id=participation_id, 
            instance=instance
        )
        
        participation.delete()
        return Response({
            'message': 'Participación eliminada correctamente'
        }, status=status.HTTP_204_NO_CONTENT)

class SurveyPublicAPIView(APIView):
    """API para obtener encuesta pública"""
    
    permission_classes = []
    
    def get(self, request, instance_id):
        try:
            # Obtener instancia de encuesta
            instance = get_object_or_404(SurveyInstance, id=instance_id)
            
            # Verificar que la encuesta esté abierta
            if instance.state != 'open':
                return Response({
                    'error': 'Survey not available',
                    'message': 'Esta encuesta no está disponible en este momento.',
                    'state': instance.state
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Obtener preguntas ordenadas
            questions = instance.survey.questions.all().order_by('id')
            
            # Verificar participación del usuario (si está autenticado)
            user_participation = None
            can_participate = True
            
            if request.user.is_authenticated:
                try:
                    user_participation = Participation.objects.get(
                        user=request.user,
                        instance=instance
                    )
                    can_participate = user_participation.state != 'completed'
                except Participation.DoesNotExist:
                    pass
            
            # Serializar datos
            questions_data = []
            for question in questions:
                question_data = {
                    'id': question.id,
                    'content': question.content,  # El campo se llama 'content', no 'text'
                    'type': question.type,
                    'order': question.id  # Usar el ID como orden por defecto
                }
                
                # Agregar opciones si es pregunta de opción múltiple
                if question.type in ['single_choice', 'multiple_choice']:
                    question_data['options'] = [
                        {
                            'id': option.id,
                            'content': option.content,  # El campo se llama 'content', no 'text'
                            'order': option.id  # Usar el ID como orden por defecto
                        }
                        for option in question.options.all()
                    ]
                
                questions_data.append(question_data)
            
            # Respuesta
            response_data = {
                'instance': {
                    'id': instance.id,
                    'title': instance.survey.title,
                    'description': instance.survey.description,
                    'state': instance.state,
                    'creation_date': instance.creation_date,
                    'closure_date': instance.closure_date,
                },
                'questions': questions_data,
                'user_status': {
                    'is_authenticated': request.user.is_authenticated,
                    'can_participate': can_participate,
                    'participation_state': user_participation.state if user_participation else None,
                    'participation_id': user_participation.id if user_participation else None
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'message': 'Ha ocurrido un error inesperado.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SurveySubmissionAPIView(APIView):
    """API para enviar respuestas de encuesta"""
    
    def post(self, request, instance_id):
        try:
            # Obtener instancia
            instance = get_object_or_404(SurveyInstance, id=instance_id)
            
            # Verificar que esté abierta
            if instance.state != 'open':
                return Response({
                    'error': 'Survey not available',
                    'message': 'Esta encuesta no está disponible.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Verificar si el usuario ya participó
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
            
            # Obtener respuestas del request
            answers = request.data.get('answers', [])
            
            if not answers:
                return Response({
                    'error': 'No answers provided',
                    'message': 'No se han proporcionado respuestas.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
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
                
                # Para preguntas de opción única
                if question.type == 'single_choice':
                    selected_option_id = answer_data.get('selected_option')
                    if selected_option_id:
                        option = question.options.filter(id=selected_option_id).first()
                        if option:
                            AnswerOption.objects.create(
                                answer=answer,
                                option=option
                            )
                
                # Para preguntas de opción múltiple
                elif question.type == 'multiple_choice':
                    selected_option_ids = answer_data.get('selected_options', [])
                    for option_id in selected_option_ids:
                        option = question.options.filter(id=option_id).first()
                        if option:
                            AnswerOption.objects.create(
                                answer=answer,
                                option=option
                            )
                
                # Para preguntas abiertas (texto)
                elif question.type == 'open':
                    text_content = answer_data.get('content', '').strip()
                    if text_content:
                        answer.content = text_content
                        answer.save()
            
            # Marcar participación como completada
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
    """API endpoint para obtener datos de la encuesta (formato JSON para React)"""
    try:
        instance = get_object_or_404(SurveyInstance, id=instance_id)
        
        if instance.state != 'open':
            return Response({
                'error': 'Survey not available',
                'message': 'Esta encuesta no está disponible en este momento.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Serializar preguntas
        questions = instance.survey.questions.all().order_by('id')
        questions_data = QuestionDetailSerializer(questions, many=True).data
        
        # Verificar participación existente del usuario
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
    """API endpoint para enviar respuestas de encuesta"""
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
            # Crear o obtener participación
            if request.user.is_authenticated:
                participation, created = Participation.objects.get_or_create(
                    user=request.user,
                    instance=instance,
                    defaults={'state': 'in_progress'}
                )
                
                if participation.state == 'completed':
                    return Response({
                        'error': 'Already completed',
                        'message': 'Ya has completado esta encuesta.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Participación anónima
                participation = Participation.objects.create(
                    user=None,
                    instance=instance,
                    state='in_progress'
                )
            
            # Eliminar respuestas existentes de esta participación
            Answer.objects.filter(participation=participation).delete()
            
            # Procesar respuestas
            for answer_data in answers_data:
                question_id = answer_data.get('question_id')
                option_id = answer_data.get('option_id')
                content = answer_data.get('content', '').strip()
                
                if not question_id:
                    continue
                
                try:
                    question = Question.objects.get(id=question_id, survey=instance.survey)
                except Question.DoesNotExist:
                    continue
                
                # Crear respuesta
                answer = Answer(
                    participation=participation,
                    question=question
                )
                
                # Manejar diferentes tipos de respuesta
                if question.type in ['multiple_choice', 'single_choice'] and option_id:
                    try:
                        option = Option.objects.get(id=option_id, question=question)
                        answer.option = option
                    except Option.DoesNotExist:
                        continue
                elif question.type in ['text', 'textarea'] and content:
                    answer.content = content
                else:
                    # Respuesta requerida pero no proporcionada
                    continue
                
                answer.save()
            
            # Marcar participación como completada
            participation.state = 'completed'
            participation.save()
        
        return Response({
            'success': True,
            'message': 'Respuestas guardadas correctamente.',
            'participation_id': participation.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Submission failed',
            'message': f'Error al guardar respuestas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def survey_stats(request, instance_id):
    """Obtener estadísticas básicas de la encuesta (públicas)"""
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


class ParticipationResultsAPIView(APIView):
    """API para obtener las respuestas de una participación específica"""
    
    def get(self, request, participation_id):
        try:
            # Obtener participación
            participation = get_object_or_404(Participation, id=participation_id)
            
            # Verificar permisos (solo el usuario que participó o el dueño de la encuesta)
            if request.user.is_authenticated:
                if (request.user != participation.user and 
                    request.user != participation.instance.survey.client):
                    return Response({
                        'error': 'Permission denied',
                        'message': 'No tienes permisos para ver estas respuestas.'
                    }, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    'error': 'Authentication required',
                    'message': 'Debes estar autenticado.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener respuestas
            answers = participation.answers.all()
            
            answers_data = []
            for answer in answers:
                answer_data = {
                    'question': {
                        'id': answer.question.id,
                        'content': answer.question.content,
                        'type': answer.question.type
                    },
                    'content': answer.content,  # Para preguntas abiertas
                    'selected_options': []
                }
                
                # Obtener opciones seleccionadas
                if answer.question.type in ['single_choice', 'multiple_choice']:
                    selected_options = answer.selected_options.all()
                    answer_data['selected_options'] = [
                        {
                            'id': so.option.id,
                            'content': so.option.content
                        }
                        for so in selected_options
                    ]
                
                answers_data.append(answer_data)
            
            response_data = {
                'participation': {
                    'id': participation.id,
                    'date': participation.date,
                    'state': participation.state,
                    'user': participation.user.username if participation.user else 'Anonymous'
                },
                'survey': {
                    'id': participation.instance.survey.id,
                    'title': participation.instance.survey.title
                },
                'answers': answers_data
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'message': 'Error al obtener las respuestas.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
