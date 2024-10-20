import pandas as pd
import numpy as np
import torch
from transformers.file_utils import is_tf_available, is_torch_available
from transformers import BertTokenizerFast, BertForSequenceClassification, BertModel # Import BertModel
from transformers import Trainer, TrainingArguments
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import time

model_save_name = "fake-news-bert-base-uncased.pt" 

path = r"D:\Documents\Coding\Shriteq 2024\fake-news-bert-base-uncased (1).pt"

model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)
model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))


model_name = "bert-base-uncased"
tokenizer = BertTokenizerFast.from_pretrained(model_name, do_lower_case=True)

app = Flask(__name__)

CORS(app)

def is_fake_news(text):
    inputs = tokenizer(text, padding=True, truncation=True, max_length=512, return_tensors="pt").to("cpu")
    outputs = model(**inputs)
    probs = outputs[0].softmax(dim = 1)
    return int(probs.argmax()) == 1

@app.route('/check_fake_news', methods = ['POST'])
def check_fake_news():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    print(f"{text} \n {is_fake_news(text)}")
    time.sleep(20)
    return jsonify ({
        'text': text,
        'is_fake_news': is_fake_news(text)

    })

if __name__ == "__main__":
    app.run()

