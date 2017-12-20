from flask import Flask, render_template, request, send_from_directory
from flask_sse import sse
import os
import json
from flask import Blueprint
from flask_redis import FlaskRedis
import redis
r = redis.StrictRedis(host='localhost', port=6379, db=0)

app = Flask(__name__,static_url_path='')

app.config["REDIS_URL"] ="redis://localhost"
app.register_blueprint(sse, url_prefix='/stream')
channel = Blueprint('channel', __name__, url_prefix='/channel')

@app.route("/webrtc")
def page():
    return render_template("webrtc.html")

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@channel.route("/send/<channel_name>/<massage_type>", methods=['POST'])
def send(channel_name, massage_type):
    print "Hello channel send!"
    sse.publish({"message": request.data}, type=massage_type, channel=channel_name)
    return "send", massage_type, "to", channel_name






# @app.route('/')
# def index():
#     return render_template("index.html")
# @app.route('/webrtc')
# def webrtc():
#     return render_template("sec.html")
#
# @app.route('/hello')
# def publish_hello():
#     sse.publish({"message": "Hello!"}, type='greeting')
#     return "Message sent!"

# @app.route('/xhr',  methods=['GET', 'POST'])
# def xhr():
#     data = request.form
#     room_id = request.form.get('chat_id')
#     tab_uuid = request.form.get('uuid')
#     if r.exists(room_id):
#         return json.dumps({'success': False}), 400, {'ContentType': 'application/json'}
#     r.set(room_id,tab_uuid)
#
#
#
#
#     return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

# @app.route('/joinxhr',  methods=['GET', 'POST'])
# def joinxhr():
#     data = request.form
#     room_id = request.form.get('chat_id')
#     if r.exists(room_id):
#         uuid= r.get(room_id)
#         # sse.publish({"message": "one peer are calling","room_id" : room_id}, type=uuid)
#         return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}
#
#
#     # r.set(room_id,1)
#
#
#
#
#     return json.dumps({'success': False}), 400, {'ContentType': 'application/json'}
#
# @app.route('/join')
# def join():
#     return render_template("join.html")