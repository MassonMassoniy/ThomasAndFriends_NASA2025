from flask import Flask, url_for, redirect, render_template, flash

app = Flask(__name__)

def index():
    # return render_template('index.html')
    return 'test'

app.add_url_rule('/', 'home', index)

if __name__ == '__main__':
    app.run(debug = True)