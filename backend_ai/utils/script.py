import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from pythainlp.tokenize import word_tokenize

MODEL_NAME = 'bert-base-multilingual-cased'
MODEL_WEIGHT = './model/wieight/model_weights_64acc.pth'
NUM_LABELS = 4

if torch.backends.mps.is_available():
    DEVICE = torch.device("mps")
elif torch.cuda.is_available():
    DEVICE = torch.device("cuda")
else:
    DEVICE = torch.device("cpu")

# DEVICE = torch.device("cpu")

print(DEVICE)

model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=NUM_LABELS)
model.load_state_dict(torch.load(MODEL_WEIGHT, map_location=torch.device(DEVICE)))
model.to(DEVICE)
model.eval()

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def helloWorld():
    print('Hello Screen')

def text_for_bert(text):
    tokens = word_tokenize(text, engine="newmm-safe")
    tokenized = " ".join(tokens)
    return tokenized

def testPredict():
    print('start predicting')
    thai_text = "ฉันรักการเขียนโปรแกรม"
    inputs = tokenize_fn(thai_text)
    print('tokenized')
    
    with torch.no_grad():
        outputs = model(
            input_ids=inputs['input_ids'],
            attention_mask=inputs['attention_mask']
        )
        logits = outputs.logits               # [1, num_labels]
        probs = torch.softmax(logits, dim=-1) # ความน่าจะเป็นแต่ละ class
        pred = torch.argmax(probs, dim=-1)
    return {"probs": probs.squeeze().tolist(), "pred": pred.item()}

def modelPredict(text):
    print('start predicting')
    inputs = tokenize_fn(text)
    print('tokenized')
    
    with torch.no_grad():
        outputs = model(
            input_ids=inputs['input_ids'],
            attention_mask=inputs['attention_mask']
        )
        logits = outputs.logits               # [1, num_labels]
        probs = torch.softmax(logits, dim=-1) # ความน่าจะเป็นแต่ละ class
        pred = torch.argmax(probs, dim=-1)
    return {"probs": probs.squeeze().tolist(), "pred": pred.item()}

def tokenize_fn(text):
    inputs = tokenizer(
        text_for_bert(text),
        truncation=True,
        padding='max_length',
        max_length=128,
        return_tensors='pt'
    )
    # .to(DEVICE) ทีละ tensor
    return {
        'input_ids': inputs['input_ids'].to(DEVICE),
        'attention_mask': inputs['attention_mask'].to(DEVICE)
    }

print(testPredict())