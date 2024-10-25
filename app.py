from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<lang_code>')
def language(lang_code):
    supported_languages = ['pl', 'ua', 'ro', 'de', 'es', 'hr']
    if lang_code in supported_languages:
        return render_template(f'index-{lang_code}.html')
    return render_template('languages.html')

@app.route('/languages')
def languages():
    return render_template('languages.html')

if __name__ == '__main__':
    app.run(debug=True)
