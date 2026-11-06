import { primaryOwnerUid } from './owner-identity.js';
import { getFirebaseConfig } from './firebase-config.js';

// This controls visibility only. Firestore rules enforce actual access.
export function renderOwnerShortcut(user,expectedUid,root=document){
 const existing=root.querySelector('#owner-shortcut');
 if(!user||user.uid!==expectedUid){existing?.remove();return;}
 if(existing)return;
 const link=root.createElement('a');link.id='owner-shortcut';link.className='owner-shortcut';link.href='/admin';link.textContent='Manage website';link.setAttribute('aria-label','Manage website — owner access');root.body.append(link);
}
export async function connectOwnerShortcut(){
 try{
  if(!getFirebaseConfig())return;
  const [{getFirebaseServices},{onAuthStateChanged}]=await Promise.all([import('./firebase-client.js'),import('firebase/auth')]);
  const {auth}=getFirebaseServices();
  const unsubscribe=onAuthStateChanged(auth,user=>renderOwnerShortcut(user,primaryOwnerUid));
  window.addEventListener('pagehide',unsubscribe,{once:true});
 }catch{renderOwnerShortcut(null,primaryOwnerUid);}
}
