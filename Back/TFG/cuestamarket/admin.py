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


# Inline para AnswerOption dentro de Answer
class AnswerOptionInline(admin.TabularInline):
    model = AnswerOption
    extra = 0
    fields = ('option', 'get_option_content')
    readonly_fields = ('get_option_content',)
    verbose_name = 'Opción seleccionada'
    verbose_name_plural = 'Opciones seleccionadas'
    
    def get_option_content(self, obj):
        return obj.option.content if obj.option else '-'
    get_option_content.short_description = 'Contenido de la opción'


# Inline para las respuestas de una participación
class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    fields = ('question', 'get_question_type', 'option', 'content', 'get_multiple_options', 'date')
    readonly_fields = ('date', 'get_question_type', 'get_multiple_options')
    
    def get_question_type(self, obj):
        return obj.question.type
    get_question_type.short_description = 'Tipo'
    
    def get_multiple_options(self, obj):
        if not obj.pk:
            return 'No guardado'
            
        if obj.question.type == 'multiple':
            # Usar el related_name correcto: selected_options
            options = obj.selected_options.all()
            if options.exists():
                return ', '.join([opt.option.content for opt in options])
            return 'Sin opciones seleccionadas'
                
        elif obj.question.type == 'single' and obj.option:
            return obj.option.content
        
        return '-'
    get_multiple_options.short_description = 'Opciones seleccionadas'


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
    list_display = ('participation', 'question', 'get_question_type', 'option', 'get_content_preview', 'get_multiple_options', 'date')
    list_filter = ('date', 'participation__instance__survey', 'question__type')
    search_fields = ('participation__user__username', 'question__content', 'content')
    readonly_fields = ('date',)
    inlines = [AnswerOptionInline]
    
    def get_content_preview(self, obj):
        if obj.content:
            return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
        return '-'
    get_content_preview.short_description = 'Contenido'
    
    def get_question_type(self, obj):
        return obj.question.type
    get_question_type.short_description = 'Tipo'
    
    def get_multiple_options(self, obj):
        if obj.question.type == 'multiple':
            # Usar el related_name correcto: selected_options
            options = obj.selected_options.all()
            if options:
                return ', '.join([opt.option.content for opt in options])
            return 'Sin opciones'
        return '-'
    get_multiple_options.short_description = 'Opciones múltiples'


# Configuración para AnswerOption (modelo independiente)
class AnswerOptionAdmin(admin.ModelAdmin):
    list_display = ('answer', 'option', 'get_question', 'get_participation', 'get_option_content')
    list_filter = ('answer__question__type', 'answer__participation__instance__survey', 'answer__date')
    search_fields = ('answer__participation__user__username', 'option__content', 'answer__question__content')
    raw_id_fields = ('answer', 'option')  # Para mejor rendimiento con muchos registros
    
    def get_question(self, obj):
        return obj.answer.question.content[:50] + '...' if len(obj.answer.question.content) > 50 else obj.answer.question.content
    get_question.short_description = 'Pregunta'
    
    def get_participation(self, obj):
        user = obj.answer.participation.user
        return user.username if user else 'Anónimo'
    get_participation.short_description = 'Usuario'
    
    def get_option_content(self, obj):
        return obj.option.content
    get_option_content.short_description = 'Contenido de la opción'


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
    list_display = ('content', 'question', 'get_question_survey', 'get_times_selected')
    list_filter = ('question__survey', 'question__type')
    search_fields = ('content', 'question__content')
    
    def get_question_survey(self, obj):
        return obj.question.survey.title
    get_question_survey.short_description = 'Encuesta'
    
    def get_times_selected(self, obj):
        # Contar cuántas veces se ha seleccionado esta opción
        single_selections = Answer.objects.filter(option=obj).count()
        multiple_selections = AnswerOption.objects.filter(option=obj).count()
        return single_selections + multiple_selections
    get_times_selected.short_description = 'Veces seleccionada'


# Registrar todos los modelos con sus configuraciones
admin.site.register(User, UserAdmin)
admin.site.register(Role, RoleAdmin)
admin.site.register(Survey, SurveyAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Option, OptionAdmin)
admin.site.register(SurveyInstance, SurveyInstanceAdmin)
admin.site.register(Participation, ParticipationAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(AnswerOption, AnswerOptionAdmin)
admin.site.register(Report, ReportAdmin)


# Personalizar el header del admin
admin.site.site_header = 'Administración de Encuestas'
admin.site.site_title = 'Admin Encuestas'
admin.site.index_title = 'Panel de Administración'