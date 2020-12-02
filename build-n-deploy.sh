npm install -g @angular/cli
npm install
ng build --prod --source-map
rm -fr socrates_bff/www/
cp -r www/ socrates_bff/www
cd socrates_bff
docker build -t gcr.io/ups-next-tracking-as-a-service/clips-socrates:latest .
gcloud docker -- push gcr.io/ups-next-tracking-as-a-service/clips-socrates:latest

kubectl scale --replicas=0 deployment/socrates-socket-server-deployment
kubectl scale --replicas=1 deployment/socrates-socket-server-deployment
