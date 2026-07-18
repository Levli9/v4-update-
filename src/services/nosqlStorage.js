// src/services/nosqlStorage.js
// A lightweight client-side NoSQL Document Database simulating MongoDB/Firestore collection structures

class NoSQLCollection {
  constructor(name) {
    this.name = name;
    // Migrate existing data from old keys if present, otherwise set collection key
    this.key = name === 'users' ? 'users' : `nosql_db_${name}`;
  }

  _getDocs() {
    try {
      const data = localStorage.getItem(this.key);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn(`ShieldX recovered from invalid local data in ${this.key}.`, error);
      return [];
    }
  }

  _saveDocs(docs) {
    localStorage.setItem(this.key, JSON.stringify(docs));
  }

  // Find documents matching a query object (NoSQL filter)
  find(query = {}) {
    const docs = this._getDocs();
    return docs.filter(doc => {
      for (let key in query) {
        if (doc[key] !== query[key]) return false;
      }
      return true;
    });
  }

  // Find a single document
  findOne(query = {}) {
    const docs = this.find(query);
    return docs.length > 0 ? docs[0] : null;
  }

  // Insert a document (adds a unique auto-generated _id)
  insertOne(doc) {
    const docs = this._getDocs();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      ...doc
    };
    docs.push(newDoc);
    this._saveDocs(docs);
    return newDoc;
  }

  // Update a document matching query fields
  updateOne(query, updateFields) {
    const docs = this._getDocs();
    let updatedDoc = null;
    const updatedDocs = docs.map(doc => {
      let matches = true;
      for (let key in query) {
        if (doc[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches && !updatedDoc) {
        updatedDoc = { 
          ...doc, 
          ...updateFields, 
          updatedAt: new Date().toISOString() 
        };
        return updatedDoc;
      }
      return doc;
    });
    this._saveDocs(updatedDocs);
    return updatedDoc;
  }
}

export const nosqlDb = {
  collection: (name) => new NoSQLCollection(name)
};

export default nosqlDb;
