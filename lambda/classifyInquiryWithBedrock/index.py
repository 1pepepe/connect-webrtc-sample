import boto3
import json

bedrock_runtime = boto3.client('bedrock-runtime')
model_id = 'amazon.titan-text-express-v1' 
accept = '*/*'
content_type = 'application/json'

def handler(event, context):
  inputText = """
  Classify the inquiry text into one of the following categories:

  Service
  Account
  Other

  When determining the category, note the following points
  Inquiries about services include the name of the service, its functions, and how to use it.
  Account inquiries include account registration, login, password change, etc.
  Inquiries about other do not fall into any of the above categories.

  Answer the output only for the category in which it was classified.

  the inquiry text is follows

  """ + event["Details"]["ContactData"]["Attributes"]["text"]
  body = {
    "inputText": inputText,
    "textGenerationConfig": {
      "maxTokenCount": 1024,
      "stopSequences": ["User:"],
      "temperature":0,
      "topP":0.9
    }    
  }

  response = bedrock_runtime.invoke_model(
    modelId=model_id,
    accept=accept,
    contentType=content_type,
    body=json.dumps(body),
  )

  response_body = json.loads(response['body'].read())
  output = response_body.get("results")[0].get("outputText")

  return {
      'statusCode': 200,
      'category': output,
      'output': output
  }