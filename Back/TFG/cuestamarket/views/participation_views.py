from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import Participation
from ..serializers import ParticipationSerializer


class ParticipationResultsAPIView(APIView):
    """API para obtener las respuestas de una participación con manejo completo de AnswerOption"""
    
    def get(self, request, participation_id):
        try:
            participation = get_object_or_404(Participation, id=participation_id)
            
            # Verificar permisos
            if request.user.is_authenticated:
                if (request.user != participation.user and 
                    request.user != participation.instance.survey.client and
                    not (request.user.role.name == 'admin' or request.user.is_staff)):
                    return Response({
                        'error': 'Permission denied',
                        'message': 'No tienes permisos para ver estas respuestas.'
                    }, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    'error': 'Authentication required',
                    'message': 'Debes estar autenticado.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener respuestas con opciones seleccionadas
            answers = participation.answers.all().select_related('question').prefetch_related('selected_options__option')
            
            answers_data = []
            for answer in answers:
                answer_data = {
                    'question': {
                        'id': answer.question.id,
                        'content': answer.question.content,
                        'type': answer.question.type,
                        'order': answer.question.order
                    },
                    'content': answer.content,
                    'selected_options': [],
                    'date': answer.date
                }
                
                # Obtener opciones seleccionadas usando AnswerOption
                if answer.question.type in ['single_choice', 'multiple_choice']:
                    selected_options = answer.selected_options.all()
                    answer_data['selected_options'] = [
                        {
                            'id': so.option.id,
                            'content': so.option.content,
                            'selected_at': so.created_at
                        }
                        for so in selected_options
                    ]
                
                answers_data.append(answer_data)
            
            # Ordenar respuestas por orden de pregunta
            answers_data.sort(key=lambda x: x['question']['order'])
            
            response_data = {
                'participation': {
                    'id': participation.id,
                    'date': participation.date,
                    'state': participation.state,
                    'user': participation.user.username if participation.user else 'Anonymous'
                },
                'survey': {
                    'id': participation.instance.survey.id,
                    'title': participation.instance.survey.title,
                    'description': participation.instance.survey.description
                },
                'instance': {
                    'id': participation.instance.id,
                    'creation_date': participation.instance.creation_date,
                    'state': participation.instance.state
                },
                'answers': answers_data,
                'summary': {
                    'total_questions': len(answers_data),
                    'answered_questions': len([a for a in answers_data if a['content'] or a['selected_options']]),
                    'completion_percentage': round(
                        (len([a for a in answers_data if a['content'] or a['selected_options']]) / len(answers_data)) * 100, 2
                    ) if answers_data else 0
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'message': 'Error al obtener las respuestas.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
