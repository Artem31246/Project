from flask import *
import requests
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

@app.route('/')
def main():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(debug=True)

