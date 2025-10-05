from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)
CORS(app)

def calculate_skill_match_score(user_skills, job_required_skills):
    """Calculate skill match score between user and job"""
    if not job_required_skills:
        return 0.5
    
    user_skill_set = set([s.lower() for s in user_skills])
    job_skill_set = set([s.lower() for s in job_required_skills])
    
    if len(job_skill_set) == 0:
        return 0.5
    
    matched_skills = user_skill_set.intersection(job_skill_set)
    match_ratio = len(matched_skills) / len(job_skill_set)
    
    return match_ratio

def calculate_text_similarity(user_skills, job_description):
    """Calculate text similarity using TF-IDF"""
    try:
        user_text = ' '.join(user_skills)
        
        if not user_text or not job_description:
            return 0.0
        
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([user_text, job_description])
        
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity)
    except:
        return 0.0

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'service': 'AI Recommendation Service'})

@app.route('/recommend', methods=['POST'])
def recommend_jobs():
    try:
        data = request.json
        user_skills = data.get('user_skills', [])
        jobs = data.get('jobs', [])
        
        if not user_skills:
            return jsonify({'recommendations': jobs})
        
        # Calculate scores for each job
        scored_jobs = []
        for job in jobs:
            # Extract job required skills
            job_skills = []
            if 'required_skills' in job and job['required_skills']:
                if isinstance(job['required_skills'], str):
                    job_skills = [s.strip() for s in job['required_skills'].split(',')]
                elif isinstance(job['required_skills'], list):
                    job_skills = [s.get('name', '') for s in job['required_skills'] if isinstance(s, dict)]
            
            # Calculate skill match score
            skill_score = calculate_skill_match_score(user_skills, job_skills)
            
            # Calculate text similarity with job description
            job_description = job.get('description', '') + ' ' + job.get('title', '')
            text_score = calculate_text_similarity(user_skills, job_description)
            
            # Combined score (70% skill match, 30% text similarity)
            final_score = (skill_score * 0.7) + (text_score * 0.3)
            
            job['recommendation_score'] = final_score
            scored_jobs.append(job)
        
        # Sort by recommendation score
        scored_jobs.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        return jsonify({'recommendations': scored_jobs})
    
    except Exception as e:
        print(f"Error in recommend_jobs: {str(e)}")
        return jsonify({'error': str(e), 'recommendations': data.get('jobs', [])}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
