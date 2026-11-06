// Firebase Web configuration is public. Access is enforced by Firestore rules.
import defaults from './firebase-public-config.json' with { type: 'json' };
export function parseFirebaseConfig(values){
 const keys=['apiKey','authDomain','projectId','appId'];
 if(keys.every(key=>!values?.[key]))return null;
 if(keys.some(key=>typeof values[key]!=='string'||!values[key].trim()))throw new Error('Complete all four Firebase Web configuration fields before building the site.');
 const config=Object.fromEntries(keys.map(key=>[key,values[key].trim()]));
 if(!/^AIza[A-Za-z0-9_-]{35}$/.test(config.apiKey)||!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(config.projectId)||!/^[a-z0-9.-]+$/i.test(config.authDomain)||!/^1:\d+:web:[a-z0-9]+$/i.test(config.appId))throw new Error('Use the public Web app configuration from Firebase Project settings. Do not use a Service Account or private key.');
 return config;
}
export function getFirebaseConfig(){
 const env=import.meta.env||{};if(env.VITE_FIREBASE_ENABLED==='false')return null;
 return parseFirebaseConfig({apiKey:env.VITE_FIREBASE_API_KEY||defaults.apiKey,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN||defaults.authDomain,projectId:env.VITE_FIREBASE_PROJECT_ID||defaults.projectId,appId:env.VITE_FIREBASE_APP_ID||defaults.appId});
}
