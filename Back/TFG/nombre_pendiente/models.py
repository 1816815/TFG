from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    name = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class User(AbstractUser):

    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True, blank=True)
    register_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username}"
    #overriding of the save method in order to assign a default role for every user.
    def save(self, *args, **kwargs):
        if not self.role:
            try:
                self.role = Role.objects.get(name='client')
            except Role.DoesNotExist:
                raise ValueError("El rol 'client' no existe en la base de datos")
        super().save(*args, **kwargs)


class Survey(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='surveys')
    title = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.title


class Question(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    content = models.TextField()
    type = models.CharField(max_length=20)

    def __str__(self):
        return f"Q: {self.content}, {self.type}"


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    content = models.CharField(max_length=255)

    def __str__(self):
        return self.content

class SurveyInstance(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='instances')
    creation_date = models.DateTimeField(auto_now_add=True)
    closure_date = models.DateTimeField(null=True, blank=True)
    state = models.CharField(max_length=20, default='open')

    def __str__(self):
        return f"Instance of {self.survey.title} - {self.creation_date.date()}"


class Participation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='participations')
    instance = models.ForeignKey(SurveyInstance, on_delete=models.CASCADE, related_name='participations')
    date = models.DateTimeField(auto_now_add=True)
    state = models.CharField(max_length=20, default='in_progress')

    def __str__(self):
        return f"{self.user.username} - {self.instance.survey.title}"

class Answer(models.Model):
    participation = models.ForeignKey(Participation, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    option = models.ForeignKey(Option, null=True, blank=True, on_delete=models.SET_NULL)
    content = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to {self.question.id} by {self.participation.user.username}"

class Report(models.Model):
    instance = models.OneToOneField(SurveyInstance, on_delete=models.CASCADE, related_name='report')
    date = models.DateTimeField(auto_now_add=True)
    summary = models.TextField()
    pdf_route = models.CharField(max_length=255)

    def __str__(self):
        return f"Report for {self.instance.survey.title}"
