#npm install -g @angular/cli
ng build --prod
rm -fr socrates_bff/www/
cp -r www/ socrates_bff/
cd socrates_bff
docker build -t gcr.io/$DEVSHELL_PROJECT_ID/clips-socrates:latest .
gcloud docker -- push gcr.io/$DEVSHELL_PROJECT_ID/clips-socrates:latest

kubectl scale --replicas=0 deployment/socrates-socket-server-deployment
kubectl scale --replicas=1 deployment/socrates-socket-server-deployment
