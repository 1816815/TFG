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

class SurveyViewSet(viewsets.ModelViewSet):
    """
    Viewset for Survey model with simple duplication logic

    When editing a survey that already has instances, it creates a new survey
    instead of modifying the original to preserve data integrity.
    """
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = [IsAuthenticated, IsClient]

    def get_queryset(self):
        # Show only surveys created by the authenticated user
        user = self.request.user
        if user.role.name == 'admin' or user.is_staff:
            return self.queryset
        return self.queryset.filter(client=user)

    def update(self, request, *args, **kwargs):
        """
        Update survey. If it has instances, create a new survey instead.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if survey has instances
        has_instances = instance.instances.exists()
        
        if has_instances:
            # Create new survey instead of updating
            return self._create_new_survey(request, instance, partial)
        else:
            # Normal update if no instances exist
            return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Partial update. If survey has instances, create new survey.
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def _create_new_survey(self, request, original_survey, partial=False):
        serializer = self.get_serializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        validated_data = dict(serializer.validated_data)
        questions_data = validated_data.pop('questions', None)

        validated_data['client'] = request.user

        with transaction.atomic():
            new_survey = Survey.objects.create(**validated_data)

            if questions_data:
                for question in questions_data:
                    options_data = question.pop('options', []) if 'options' in question else []
                    new_question = Question.objects.create(survey=new_survey, **question)
                    for option in options_data:
                        Option.objects.create(question=new_question, **option)
            else:
                self._copy_questions_and_options(original_survey, new_survey)

        response_serializer = self.get_serializer(new_survey)

        return Response({
            'message': 'Survey has instances. New survey created instead of updating.',
            'original_survey_id': original_survey.id,
            'new_survey': response_serializer.data,
            'instances_count': original_survey.instances.count()
        }, status=status.HTTP_201_CREATED)

    def _copy_questions_and_options(self, source_survey, target_survey):
        """
        Copy questions and their options from source survey to target survey.
        """
        for question in source_survey.questions.all():
            new_question = Question.objects.create(
                survey=target_survey,
                content=question.content,
                type=question.type,
                order=question.order,
                is_required=getattr(question, 'is_required', False)
            )
            
            for option in question.options.all():
                Option.objects.create(
                    question=new_question,
                    content=option.content,
                    order=getattr(option, 'order', option.id)
                )

    @action(detail=True, methods=['get'])
    def can_edit_directly(self, request, pk=None):
        """
        Check if survey can be edited directly (no instances exist).
        """
        survey = self.get_object()
        has_instances = survey.instances.exists()
        
        return Response({
            'can_edit_directly': not has_instances,
            'has_instances': has_instances,
            'instances_count': survey.instances.count(),
            'message': 'Survey can be edited directly' if not has_instances 
                      else 'Survey has instances. Editing will create a new survey.'
        })


class SurveyConfigurationViewSet(viewsets.ViewSet):

    """ViewSet para configuraciones avanzadas de encuestas"""
    permission_classes = [IsAuthenticated]
    
    def get_survey_instance(self, instance_id):
        user = self.request.user
        if user.role.name == 'admin' or user.is_staff:
            return get_object_or_404(SurveyInstance, id=instance_id)
        else:
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
        """Exportar datos de respuestas con soporte completo para preguntas múltiples"""
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
                
                column_name = f'pregunta_{question.id}_{question.content[:50]}'  # Usar ID + contenido truncado
                
                if answer:
                    if question.type == 'multiple':
                        # Manejar preguntas de opción múltiple
                        selected_options = answer.selected_options.all()
                        if selected_options.exists():
                            # Concatenar todas las opciones separadas por punto y coma
                            options_text = '; '.join([opt.option.content for opt in selected_options])
                            row[column_name] = options_text
                            
                        else:
                            row[column_name] = 'Sin opciones seleccionadas'
                            
                    elif question.type == 'single':
                        # Manejar preguntas de opción única
                        if answer.option:
                            row[column_name] = answer.option.content
                        else:
                            row[column_name] = 'Sin opción seleccionada'
                            
                    elif question.type in ['open', 'text', 'textarea']:
                        # Manejar preguntas de texto libre
                        if answer.content:
                            row[column_name] = answer.content
                        else:
                            row[column_name] = 'Sin respuesta de texto'
                            
                    else:
                        # Tipo de pregunta no reconocido
                        row[column_name] = f'Tipo no soportado: {question.type}'
                else:
                    # No hay respuesta para esta pregunta
                    row[column_name] = 'Sin respuesta'
            
            export_data.append(row)
        
        # Obtener estadísticas adicionales para el reporte
        stats = {
            'total_questions': instance.survey.questions.count(),
            'questions_by_type': {},
            'completion_rate': {}
        }
        
        # Calcular estadísticas por tipo de pregunta
        for question_type in ['single', 'multiple', 'open', 'text', 'textarea']:
            count = instance.survey.questions.filter(type=question_type).count()
            if count > 0:
                stats['questions_by_type'][question_type] = count
        
        # Calcular tasa de finalización por pregunta
        total_participations = participations.count()
        if total_participations > 0:
            for question in instance.survey.questions.all():
                answered_count = Answer.objects.filter(
                    participation__in=participations,
                    question=question
                ).count()
                completion_percentage = round((answered_count / total_participations) * 100, 2)
                stats['completion_rate'][f'pregunta_{question.id}'] = completion_percentage
        
        return Response({
            'data': export_data,
            'headers': list(export_data[0].keys()) if export_data else [],
            'total_responses': len(export_data),
            'survey_title': instance.survey.title,
            'export_date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'statistics': stats,
            'metadata': {
                'instance_id': instance.id,
                'survey_id': instance.survey.id,
                'creation_date': instance.creation_date.strftime('%Y-%m-%d %H:%M:%S'),
                'closure_date': instance.closure_date.strftime('%Y-%m-%d %H:%M:%S') if instance.closure_date else None,
                'state': instance.state
            }
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
            instance = get_object_or_404(SurveyInstance, id=instance_id)
            
            if instance.state != 'open':
                return Response({
                    'error': 'Survey not available',
                    'message': 'Esta encuesta no está disponible en este momento.',
                    'state': instance.state
                }, status=status.HTTP_403_FORBIDDEN)
            
            questions = instance.survey.questions.all()
            
            # Verificar participación del usuario
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
            
            questions_data = []
            for question in questions:
                question_data = {
                    'id': question.id,
                    'content': question.content,
                    'type': question.type,
                    'order': question.order
                }
                
                if question.type in ['single', 'multiple']:
                    question_data['options'] = [
                        {
                            'id': option.id,
                            'content': option.content,
                           
                        }
                        for option in question.options.all().order_by('id')  
                    ]
                
                questions_data.append(question_data)
            
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
                'message': 'Ha ocurrido un error inesperado.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

