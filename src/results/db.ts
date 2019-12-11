import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import PouchDB from "pouchdb" // TODO: Add a wrapper so we can remove `allowSyntheticDefaultImports`.
import PouchDBFind from "pouchdb-find" // TODO: Add a wrapper so we can remove `allowSyntheticDefaultImports`.

PouchDB.plugin(PouchDBFind);

// For simplicity, we only have one DB for now.
export const globalResults: PouchDB.Database<{}> = new PouchDB("results");
