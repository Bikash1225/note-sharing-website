from app import create_app, db
import os

app = create_app(os.environ.get('FLASK_CONFIG', 'development'))

@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)