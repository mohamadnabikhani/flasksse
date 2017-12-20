# flasksse
first create a [virtual enviroment](https://virtualenv.pypa.io/en/stable/), then install pyhton package from [requirement.txt](https://github.com/mohamadnabikhani/flasksse/blob/master/requirement.txt) with:
```
pip install -f requirement.txt
```
start server with:
```
gunicorn sse:app --worker-class gevent --bind 127.0.0.1:8000
```
