from django import template
from django.conf import settings

register = template.Library()


@register.simple_tag
def is_debug():
    """
    Simple tag function to retrieve the debug setting. The intention here is to
    load the vite assets in debug mode or point to the built assets (js & css)
    """
    return getattr(settings, 'DEBUG', False)
