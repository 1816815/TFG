from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class Role(models.Model):
    """
    Model representing a role of a user in the system.
    """
    name = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    """
    A user of the system.

    This model represents a user of the system, with additional fields
    for the user's email and role.
    """
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True, blank=True)
    register_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username}"

    def save(self, *args, **kwargs):
        """
        Save the user.

        If the role is not set, the default role is 'client'.
        """
        if not self.role:
            try:
                self.role = Role.objects.get(name='client')
            except Role.DoesNotExist:
                Role.objects.create(name='client')
                self.role = Role.objects.get(name='client')
                
        super().save(*args, **kwargs)


class Survey(models.Model):
    """
    Model representing a survey.

    This model stores information about surveys created by clients.
    Each survey is associated with a user (client) and contains a title
    and a description.
    
    Attributes:
        client (ForeignKey): The client associated with the survey.
        title (str): The title of the survey.
        description (str): A detailed description of the survey.
    """
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='surveys')
    title = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        """
        Returns a string representation of the survey, which is its title.

        Returns:
            str: The title of the survey.
        """
        return self.title


class Question(models.Model):
    """
    Model representing a question in a survey.

    This model stores information about each question in a survey.
    It is associated with a survey and contains the content of the
    question and its type.

    Attributes:
        survey (ForeignKey): The survey associated with the question.
        content (str): The content of the question.
        type (str): The type of the question.
    """

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    content = models.TextField()
    type = models.CharField(max_length=20)

    def __str__(self):
        return f"Q: {self.content}, {self.type}"


class Option(models.Model):
    """
    Model representing an option for a question in a survey.

    This model stores information about each option for a question in a survey.
    It is associated with a question and contains the content of the
    option.

    Attributes:
        question (ForeignKey): The question associated with the option.
        content (str): The content of the option.
    """

    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    content = models.CharField(max_length=255)

    def __str__(self):
        return self.content

class SurveyInstance(models.Model):
    """
    Model representing an instance of a survey.

    This model stores information about each instance of a survey.
    It is associated with a survey and contains the creation and closure dates
    and the state of the survey.

    Attributes:
        survey (ForeignKey): The survey associated with this instance.
        creation_date (DateTimeField): The date when the survey was created.
        closure_date (DateTimeField): The date when the survey was closed.
        state (CharField): The state of the survey.
    """

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='instances')
    creation_date = models.DateTimeField(auto_now_add=True)
    closure_date = models.DateTimeField(null=True, blank=True)
    @property
    def state(self):
        if self.closure_date is None:
            return 'draft'
        elif timezone.now() >= self.closure_date:
            return 'closed'
        return 'open'

    def __str__(self):
        return f"Instance of {self.survey.title} - {self.creation_date.date()}"


class Participation(models.Model):
    """
    Model representing the participation of a user in an instance of a survey.

    This model stores information about the participation of a user in an instance of a survey.
    It is associated with a user and an instance of a survey and contains the date of the
    participation and the state of the participation.

    Attributes:
        user (ForeignKey): The user associated with the participation.
        instance (ForeignKey): The instance of the survey associated with the participation.
        date (DateTimeField): The date when the participation was registered.
        state (CharField): The state of the participation.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='participations')
    instance = models.ForeignKey(SurveyInstance, on_delete=models.CASCADE, related_name='participations')
    date = models.DateTimeField(auto_now_add=True)
    state = models.CharField(max_length=20, default='in_progress')

    def __str__(self):
        return f"{self.user.username} - {self.instance.survey.title}"

class Answer(models.Model):
    """
    Model representing the answer of a user to a question in an instance of a survey.

    This model stores information about the answer of a user to a question in an instance of a survey.
    It is associated with a participation and a question, and contains the chosen option and the content
    of the answer if the question is of type 'open'.

    Attributes:
        participation (ForeignKey): The participation associated with the answer.
        question (ForeignKey): The question associated with the answer.
        option (ForeignKey): The option chosen by the user.
        content (TextField): The content of the answer if the question is of type 'open'.
        date (DateTimeField): The date when the answer was registered.
    """

    participation = models.ForeignKey(Participation, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    option = models.ForeignKey(Option, null=True, blank=True, on_delete=models.SET_NULL)
    content = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to {self.question.id} by {self.participation.user.username}"
    

class AnswerOption(models.Model):
    """
    Model representing the relationship between an answer and selected options.
    
    This model allows multiple options to be selected for a single answer,
    which is necessary for multiple choice questions.
    
    Attributes:
        answer (ForeignKey): The answer associated with this option selection.
        option (ForeignKey): The option that was selected.
        created_at (DateTimeField): When this option was selected.
    """
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='selected_options')
    option = models.ForeignKey(Option, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['answer', 'option']
    
    def __str__(self):
        return f"{self.answer.question.content[:50]} -> {self.option.content}"


class Report(models.Model):
    """
    Model representing a report for a survey instance.

    This model stores information about a report generated for a specific
    instance of a survey. It includes the date the report was created, a 
    summary of the report, and the file path to the PDF version of the report.

    Attributes:
        instance (OneToOneField): The survey instance associated with the report.
        date (DateTimeField): The date the report was created.
        summary (TextField): A summary of the report.
        pdf_route (CharField): The file path to the PDF version of the report.
    """
    instance = models.OneToOneField(SurveyInstance, on_delete=models.CASCADE, related_name='report')
    date = models.DateTimeField(auto_now_add=True)
    summary = models.TextField()
    pdf_route = models.CharField(max_length=255)

    def __str__(self):
        return f"Report for {self.instance.survey.title}"
