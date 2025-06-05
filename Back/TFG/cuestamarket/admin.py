from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *


# Configuración para User con los nuevos campos
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'register_date', 'is_active', 'is_staff')
    list_filter = ('role', 'register_date', 'is_active', 'is_staff')
    search_fields = ('username', 'email')
    ordering = ('-register_date',)
    
    # Añadir los nuevos campos a los fieldsets
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información adicional', {'fields': ('role', 'register_date')}),
    )
    readonly_fields = ('register_date',)


# Configuración para Role
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


# Inline para las opciones de una pregunta
class OptionInline(admin.TabularInline):
    model = Option
    extra = 2  # Muestra 2 campos extra para añadir opciones
    fields = ('content',)


# Configuración para Question con opciones inline
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('content', 'type', 'survey', 'get_options_count')
    list_filter = ('type', 'survey')
    search_fields = ('content', 'survey__title')
    inlines = [OptionInline]
    
    def get_options_count(self, obj):
        return obj.options.count()
    get_options_count.short_description = 'Nº Opciones'


# Inline para las preguntas de una encuesta
class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    fields = ('content', 'type')
    show_change_link = True  # Permite editar la pregunta en detalle


# Inline para las instancias de una encuesta
class SurveyInstanceInline(admin.TabularInline):
    model = SurveyInstance
    extra = 0
    fields = ('creation_date', 'closure_date',)
    readonly_fields = ('creation_date',)
    show_change_link = True

    def get_state(self, obj):
        return obj.state
    get_state.short_description = 'State'


# Configuración para Survey con preguntas e instancias inline
class SurveyAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'get_questions_count', 'get_instances_count')
    list_filter = ('client',)
    search_fields = ('title', 'description', 'client__username')
    inlines = [QuestionInline, SurveyInstanceInline]
    
    def get_questions_count(self, obj):
        return obj.questions.count()
    get_questions_count.short_description = 'Nº Preguntas'
    
    def get_instances_count(self, obj):
        return obj.instances.count()
    get_instances_count.short_description = 'Nº Instancias'


# Inline para las participaciones de una instancia
class ParticipationInline(admin.TabularInline):
    model = Participation
    extra = 0
    fields = ('user', 'date', 'state')
    readonly_fields = ('date',)
    show_change_link = True


# Configuración para SurveyInstance
class SurveyInstanceAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'survey', 'creation_date', 'closure_date', 'get_state', 'get_participations_count')
    list_filter = ('creation_date', 'survey',)
    search_fields = ('survey__title',)
    readonly_fields = ('creation_date',)
    inlines = [ParticipationInline]

    def get_state(self, obj):
        return obj.state
    get_state.short_description = 'State'
    
    def get_participations_count(self, obj):
        return obj.participations.count()
    get_participations_count.short_description = 'Nº Participaciones'


# Inline para las respuestas de una participación
class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    fields = ('question', 'option', 'content', 'date')
    readonly_fields = ('date',)


# Configuración para Participation
class ParticipationAdmin(admin.ModelAdmin):
    list_display = ('user', 'instance', 'date', 'state', 'get_answers_count')
    list_filter = ('state', 'date', 'instance__survey')
    search_fields = ('user__username', 'instance__survey__title')
    readonly_fields = ('date',)
    inlines = [AnswerInline]
    
    def get_answers_count(self, obj):
        return obj.answers.count()
    get_answers_count.short_description = 'Nº Respuestas'


# Configuración para Answer
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('participation', 'question', 'option', 'get_content_preview', 'date')
    list_filter = ('date', 'participation__instance__survey', 'question__type')
    search_fields = ('participation__user__username', 'question__content', 'content')
    readonly_fields = ('date',)
    
    def get_content_preview(self, obj):
        if obj.content:
            return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
        return '-'
    get_content_preview.short_description = 'Contenido'


# Configuración para Report
class ReportAdmin(admin.ModelAdmin):
    list_display = ('instance', 'date', 'get_summary_preview', 'pdf_route')
    list_filter = ('date', 'instance__survey')
    search_fields = ('instance__survey__title', 'summary')
    readonly_fields = ('date',)
    
    def get_summary_preview(self, obj):
        return obj.summary[:100] + '...' if len(obj.summary) > 100 else obj.summary
    get_summary_preview.short_description = 'Resumen'


# Configuración para Option (por si necesitas editarlas por separado)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('content', 'question', 'get_question_survey')
    list_filter = ('question__survey', 'question__type')
    search_fields = ('content', 'question__content')
    
    def get_question_survey(self, obj):
        return obj.question.survey.title
    get_question_survey.short_description = 'Encuesta'


# Registrar todos los modelos con sus configuraciones
admin.site.register(User, UserAdmin)
admin.site.register(Role, RoleAdmin)
admin.site.register(Survey, SurveyAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Option, OptionAdmin)
admin.site.register(SurveyInstance, SurveyInstanceAdmin)
admin.site.register(Participation, ParticipationAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(Report, ReportAdmin)


# Personalizar el header del admin
admin.site.site_header = 'Administración de Encuestas'
admin.site.site_title = 'Admin Encuestas'
admin.site.index_title = 'Panel de Administración'