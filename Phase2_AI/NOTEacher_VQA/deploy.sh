set -e

echo "Initiating NOTEacher cloud deployment protocol..."

PROJECT_ID="noteacher-production-123"
REGION="us-central1"
SERVICE_NAME="vqa-engine"
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "Step 1: Building Multi-Stage Docker Image..."
docker build -t $IMAGE_TAG -f Dockerfile.prod  .

echo "Step 2: Pushing Image to cloud registry..."
docker push $IMAGE_TAG

echo "Step 3: Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_TAG \
    --platform managed \
    --region $REGION \
    --memory 2Gi \
    --allow-unauthenticated \
    --max-instances 10

echo "\n Deployment Complete!"
echo "Your API is now live and globally accesible."
