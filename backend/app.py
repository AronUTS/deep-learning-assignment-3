from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder='static', static_url_path='')

# ---------------------
# API Routes (prefixed with /api)
# ---------------------
@app.route('/api/hello')
def hello():
    return jsonify(message="Hello from Flask!")


# ---------------------
# Catch all error handler defaults to react app default route (homepage) for any non defined route.
# ---------------------
@app.errorhandler(404)   
def not_found(e):   
  return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
