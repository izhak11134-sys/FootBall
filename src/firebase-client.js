import { initializeApp,getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig } from './firebase-config.js';
let instance;
export function getFirebaseServices(){
 if(instance)return instance;
 const config=getFirebaseConfig();if(!config)return null;
 const app=getApps().find(app=>app.name==='form-and-roar')||initializeApp(config,'form-and-roar');
 instance={app,auth:getAuth(app),db:getFirestore(app)};return instance;
}
