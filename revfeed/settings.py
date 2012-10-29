from os import environ


# Defaults

DEBUG = False

WEB_HOST = "localhost"
WEB_PORT = 5000

REDIS_HOST = "localhost"
REDIS_PORT = 6379

REPO_DIRS = "./.git"

COMMITS_PER_FETCH = 10


# Get config from ENV

_locals = locals()

for key in _locals.keys():
    if key.isupper():
        value = environ.get(key)
        if value:
            _locals[key] = value


REPO_DIRS = REPO_DIRS.split(',')
