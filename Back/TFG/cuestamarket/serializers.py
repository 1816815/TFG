from django.utils import timezone
from rest_framework import serializers
from .models import User, Role, Survey, Question, Option, Answer, Participation, SurveyInstance, Report
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    This serializer is used to validate and create new User instances.
    It includes fields for the username, email and password of the new user.
    The password field is write-only and required. The email field is optional.
    """
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        """
        Creates a new User instance with the provided data.

        Args:
            validated_data (dict): Validated data for the User.

        Returns:
            User: The newly created User instance.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer for Role model.
    
    This serializer is used to convert Role model instances to JSON data and vice versa.
    It includes fields for the Role's ID and name.
    """

    class Meta:
        model = Role
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.

    This serializer is responsible for converting User model instances
    to JSON data and vice versa. It handles the creation and update of
    User instances, including setting passwords and assigning roles.

    Attributes:
        role (RoleSerializer): Read-only field for the nested role representation.
        role_id (IntegerField): Write-only field for role ID to assign a role.
    """
    role = RoleSerializer(read_only=True)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'role_id', 'password', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def create(self, validated_data):
        """
        Creates a new User instance.

        Args:
            validated_data (dict): Validated data for the User.

        Returns:
            User: The newly created User instance.
        """
        role_id = validated_data.pop('role_id', None)
        password = validated_data.pop('password', None)
        
        # Create user
        user = User(**validated_data)
        
        # Set password if provided
        if password:
            user.set_password(password)
        
        # Assign role if provided
        if role_id:
            try:
                role = Role.objects.get(id=role_id)
                user.role = role
            except Role.DoesNotExist:
                pass
                
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """
        Updates an existing User instance.

        Args:
            instance (User): The user instance to be updated.
            validated_data (dict): Validated data for the update.

        Returns:
            User: The updated User instance.
        """
        role_id = validated_data.pop('role_id', None)
        password = validated_data.pop('password', None)
        
        # Update fields
        for key, value in validated_data.items():
            setattr(instance, key, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
            
        # Update role if provided
        if role_id is not None:
            try:
                role = Role.objects.get(id=role_id)
                instance.role = role
            except Role.DoesNotExist:
                instance.role = None
                
        instance.save()
        return instance

class OptionSerializer(serializers.ModelSerializer):
    """
    Serializer for Option model

    This serializer is used to convert Option models to JSON data
    and vice versa. It only serializes the `content` field.
    """
    class Meta:
        model = Option
        fields = ['content']


class QuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for Question model

    This serializer is used to convert Question models to JSON data
    and vice versa. It also handles the creation of new Questions
    and their related Options.

    The `options` field is a nested serializer that handles
    the creation of related Options. The Options are created with
    the `question` field set to the Question being created.
    """
    options = OptionSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['content', 'type', 'options']

    def create(self, validated_data):
        """
        Creates a new Question with its related Options.

        Args:
            validated_data (dict): Validated data for the Question.

        Returns:
            Question: The newly created Question.
        """
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
        return question

    def update(self, instance, validated_data):
        """
        Updates a Question and its related Options.

        Args:
            instance (Question): The Question instance to update.
            validated_data (dict): Validated data for the Question.

        Returns:
            Question: The updated Question.
        """
        options_data = validated_data.pop('options', [])
        
        instance.content = validated_data.get('content', instance.content)
        instance.type = validated_data.get('type', instance.type)
        instance.save()
        
        instance.options.all().delete()
        
        for option_data in options_data:
            Option.objects.create(question=instance, **option_data)
        
        return instance


class SurveySerializer(serializers.ModelSerializer):
    """
    Serializer for Survey model

    This serializer is used to convert Survey models to JSON data
    and vice versa. It also handles the creation of new Surveys
    and their related Questions and Options.

    The `questions` field is a nested serializer that handles
    the creation of related Questions and Options. The Questions
    are created with the `survey` field set to the Survey being
    created, and the Options are created with the `question` field
    set to the Question being created.
    """
    questions = QuestionSerializer(many=True)
    instances_count = serializers.SerializerMethodField()

    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'questions', 'instances_count']
        read_only_fields = ['id']

    def create(self, validated_data):
        """
        Creates a new Survey with its related Questions and Options.

        Args:
            validated_data (dict): Validated data for the Survey.

        Returns:
            Survey: The newly created Survey.
        """
        questions_data = validated_data.pop('questions')
        survey = Survey.objects.create(client=self.context['request'].user, **validated_data)
        
        for question_data in questions_data:
            options_data = question_data.pop('options', [])
            question = Question.objects.create(survey=survey, **question_data)
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)
        
        return survey

    def update(self, instance, validated_data):
        """
        Updates a Survey and its related Questions and Options.

        Args:
            instance (Survey): The Survey instance to update.
            validated_data (dict): Validated data for the Survey.

        Returns:
            Survey: The updated Survey.
        """
        questions_data = validated_data.pop('questions', [])
        
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        
        instance.questions.all().delete()
        
        for question_data in questions_data:
            options_data = question_data.pop('options', [])
            question = Question.objects.create(survey=instance, **question_data)
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)
        
        return instance

    def get_instances_count(self, obj):
        return obj.instances.count()
        
    

class SurveyInstanceSerializer(serializers.ModelSerializer):
    survey = SurveySerializer(read_only=True)
    survey_id= serializers.PrimaryKeyRelatedField(
        queryset=Survey.objects.all(), write_only=True
        )
    total_questions = serializers.SerializerMethodField()
    total_participations = serializers.SerializerMethodField()
    completed_participations = serializers.SerializerMethodField()
    days_active = serializers.SerializerMethodField()
    
    class Meta:
        model = SurveyInstance
        fields = [
            'id', 'survey', 'survey_id' ,'creation_date', 'closure_date', 'state',
            'total_questions', 'total_participations', 'completed_participations',
            'days_active'
        ]

    def create(self, validated_data):
        survey = validated_data.pop('survey_id')
        instance = SurveyInstance.objects.create(survey=survey, **validated_data)
        return instance
    def get_total_questions(self, obj):
        return obj.survey.questions.count()
    
    def get_total_participations(self, obj):
        return obj.participations.count()
    
    def get_completed_participations(self, obj):
        return obj.participations.filter(state='completed').count()
    
    def get_days_active(self, obj):
        if obj.closure_date:
            return (obj.closure_date - obj.creation_date).days
        return (timezone.now() - obj.creation_date).days

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'content']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'content', 'type']

class QuestionDetailSerializer(QuestionSerializer):
    options = OptionSerializer(many=True, read_only=True)
    
    class Meta(QuestionSerializer.Meta):
        fields = QuestionSerializer.Meta.fields + ['options']

class SurveyInstanceDetailSerializer(SurveyInstanceSerializer):
    survey_questions = QuestionDetailSerializer(source='survey.questions', many=True, read_only=True)
    
    class Meta(SurveyInstanceSerializer.Meta):
        fields = SurveyInstanceSerializer.Meta.fields + ['survey_questions']

class ParticipationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_answers = serializers.SerializerMethodField()
    
    class Meta:
        model = Participation
        fields = ['id', 'user', 'date', 'state', 'total_answers']
    
    def get_total_answers(self, obj):
        return obj.answers.count()