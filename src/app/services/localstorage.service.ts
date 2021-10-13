import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class LocalstorageService {

  constructor(private platform: Platform,
              private storage: Storage) {
      this.storage.create();
  }

  async getDoc(path: string) {
    await this.platform.ready();
    const doc = await this.storage.get(path).catch((error) => {
      console.log('error en LocalStorageService -> getDoc', error);
    });
    if (doc !== undefined && doc !== null) {
      return doc;
    } else {
      return null;
    }
  }

  async deleteDoc(path: string) {
    return this.storage.remove(path);
  }

  async setDoc(path: string, doc: any) {
    return this.storage.set(path, doc);
  } 
}
