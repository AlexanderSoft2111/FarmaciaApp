import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(public FireStore: AngularFirestore) { 
  }

  getCollectionChanges<tipo>(path: string): Observable<tipo[]> {
      const itemsCollection: AngularFirestoreCollection<tipo> =
                        this.FireStore.collection<tipo>(path);
      return itemsCollection.valueChanges();
  }

  getDocument<tipo>(enlace: string) {
      const itemDoc: AngularFirestoreDocument<tipo> = this.FireStore.doc<tipo>(enlace);
      return itemDoc.ref.get();
  }

  getCollection<tipo>(path: string) {
    
    const itemsCollection: AngularFirestoreCollection<tipo> =
                      this.FireStore.collection<tipo>(path);
    return itemsCollection.ref.get();
  }

  getDocumentChanges <tipo>(enlace: string): Observable<tipo> {
    const itemDoc: AngularFirestoreDocument<tipo> = this.FireStore.doc<tipo>(enlace);
    return itemDoc.valueChanges();
  }

  getDocumentFromCache<tipo>(enlace: string): Promise<tipo | null> {
    return new Promise( async (resolve) => {
      await this.FireStore.firestore.enableNetwork();
                   this.getDocument<tipo>(enlace).then( docServer => {
                      if (docServer.exists) {
                        resolve(docServer.data());
                      } else {
                        resolve(null);
                      }
                   }).catch ( () => {
                    resolve(null);
                   })

    });
  }

 getCollectionFromCache<tipo>(enlace: string): Promise<tipo[] | null>  {
    return new Promise( async (resolve) => {
      this.getCollection<tipo>(enlace).then( docsServer => {
        if (docsServer.empty) {
          resolve(null);
        } else {
          const collection: tipo[] = [];
          docsServer.docs.forEach( doc => {
             collection.push(doc.data());
          })
          resolve(collection);
        }
     });

  });
} 

  getCollectionProductos<tipo>(enlace: string){
    const productsCollection: AngularFirestoreCollection<tipo> = this.FireStore.collection<tipo>(enlace);

    return productsCollection.valueChanges();

  }

  createDocument<tipo>(data: tipo, enlace: string) {
    const itemsCollection: AngularFirestoreCollection<tipo> =
                      this.FireStore.collection<tipo>(enlace);
    return itemsCollection.add(data);
  }

  createDocumentID <tipo>(data: tipo, enlace: string, idDoc: string) {
    const itemsCollection: AngularFirestoreCollection<tipo> =
                          this.FireStore.collection<tipo>(enlace);
    return itemsCollection.doc(idDoc).set(data);
  }

  updateDocumentID <tipo>(data: tipo, enlace: string, idDoc: string) {
    const itemsCollection: AngularFirestoreCollection<tipo> =
                          this.FireStore.collection<tipo>(enlace);
    return itemsCollection.doc(idDoc).update(data);
  }

  createIdDoc(): string {
    return this.FireStore.createId();
  }

  deleteDocumentID(enlace: string, idDoc: string) {
    const itemsCollection: AngularFirestoreCollection =
                          this.FireStore.collection(enlace);
    return itemsCollection.doc(idDoc).delete();
  }

  getCollectionQuery<tipo>(path: string, parametro: string, busqueda: any): Observable<tipo[]> {
    const itemsCollection: AngularFirestoreCollection<tipo> =
                      this.FireStore.collection<tipo>(path
                         , ref => ref.where (parametro, '==', busqueda));
    return itemsCollection.valueChanges();
  }

  getCollectionOrderLimit<tipo>(path: string, orderId: string, directionSort: 'asc' | 'desc'): Observable<tipo[]> {
   
      const itemsCollection: AngularFirestoreCollection<tipo> =
                        this.FireStore.collection<tipo>(path
                           , ref => ref.orderBy(orderId, directionSort));
         
      return itemsCollection.valueChanges();
   
  }

  getCollectionQueryOrderLimit<tipo>(path: string, parametro: string, busqueda: any,
                                     LIMIT: number, orderId: string, directionSort: 'asc' | 'desc',
                                     STARTAT?: any): Observable<tipo[]> {
      if (STARTAT === null) {
          const itemsCollection: AngularFirestoreCollection<tipo> =
          this.FireStore.collection<tipo>(path
                  , ref => ref.where(parametro, '==', busqueda)
                          .orderBy(orderId, directionSort)
                          .limit(LIMIT));
          return itemsCollection.valueChanges();
      } else {
          const itemsCollection: AngularFirestoreCollection<tipo> =
          this.FireStore.collection<tipo>(path
          , ref => ref.where(parametro, '==', busqueda)
                      .orderBy(orderId, directionSort)
                      .startAfter(STARTAT).limit(LIMIT));
          return itemsCollection.valueChanges();
      }
  }


}
