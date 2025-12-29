from flask import Flask, request, jsonify, render_template
from weather import weather_blueprint
import os

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(
    __name__,
    static_folder=os.path.join(base, "frontend", "static"),
    template_folder=os.path.join(base, "frontend", "templates")
)

@app.route('/')
def main():
    return render_template("index.html")

app.register_blueprint(weather_blueprint)

if __name__ == "__main__":
    app.run(debug=True)
