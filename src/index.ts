/**
 * Main file
 * Copyright (c) 2016 Fadhli Dzil Ikram
 */

'use strict'

import * as sqlite from 'sqlite3'
import { isFunction } from 'lodash'

export const OPEN_CREATE = sqlite.OPEN_CREATE
export const OPEN_READONLY = sqlite.OPEN_READONLY
export const OPEN_READWRITE = sqlite.OPEN_READWRITE

export interface RowFunction {
  (row: any): void
}

export interface ErrorFunction {
  (err: Error): void
}

export default function NewDatabase(filename: string, mode?: number): Promise<Database>
export default function NewDatabase(filename: string, mode: number | undefined) {
  return new Promise((resolve, reject) => {
    let db: Database
    if (mode === undefined) {
      db = new Database(filename, callback)
    } else {
      db = new Database(filename, mode, callback)
    }
    function callback(err: Error) {
      if (err) {
        return reject(err)
      }
      resolve(db)
    }
  })
}

export interface Statement extends sqlite.Statement {}

export class Statement {
  private obj: sqlite.Statement

  constructor(stmt: sqlite.Statement) {
    this.obj = stmt
  }

  bindAsync(...params: any[]): Promise<any>
  bindAsync() {
    return new Promise((resolve, reject) => {
      Array.prototype.push.call(arguments, (err: Error) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
      this.obj.bind.apply(this, arguments)
    })
  }

  resetAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.obj.reset((err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  finalizeAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.obj.finalize((err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  // Function reuse from database class
  runAsync(...params: any[]): Promise<any>
  runAsync() {
    return Database.prototype.runAsync.apply(this, arguments)
  }

  getAsync(...params: any[]): Promise<any>
  getAsync() {
    return Database.prototype.runAsync.apply(this, arguments)
  }

  allAsync(...params: any[]): Promise<any>
  allAsync() {
    return Database.prototype.runAsync.apply(this, arguments)
  }

  eachAsync(...params: any[]): Promise<any>
  eachAsync() {
    return Database.prototype.runAsync.apply(this, arguments)
  }

  // Function proxy
  bind() {
    return this.obj.bind.apply(this.obj, arguments)
  }

  reset() {
    return this.obj.reset.apply(this.obj, arguments)
  }

  finalize() {
    return this.obj.finalize.apply(this.obj, arguments)
  }

  run() {
    return this.obj.run.apply(this.obj, arguments)
  }

  get() {
    return this.obj.get.apply(this.obj, arguments)
  }

  all() {
    return this.obj.all.apply(this.obj, arguments)
  }

  each() {
    return this.obj.each.apply(this.obj, arguments)
  }
}

export interface Database extends sqlite.Database{}

function construct(cls: Function, args: IArguments) {
  Array.prototype.unshift.call(args, null)
  return new (Function.prototype.bind.apply(cls, args))
}

export class Database {
  private obj: sqlite.Database

  constructor(filename: string)
  constructor(filename: string, mode: number)
  constructor(filename: string, callback: ErrorFunction)
  constructor(filename: string, mode: number, callback: ErrorFunction)
  constructor() {
    this.obj = construct(sqlite.Database, arguments)
  }

  closeAsync(): Promise<any>
  closeAsync() {
    return new Promise((resolve, reject) => {
      this.obj.close((err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  runAsync(sql: string, ...params: any[]): Promise<number>
  runAsync() {
    return new Promise((resolve, reject) => {
      Array.prototype.push.call(arguments, function (err: Error) {
        if (err) {
          return reject(err)
        }
        resolve(Math.max(this.lastID, this.changes))
      })
      this.obj.run.apply(this.obj, arguments)
    })
  }

  getAsync(sql: string, ...params: any[]): Promise<any>
  getAsync() {
    return new Promise((resolve, reject) => {
      Array.prototype.push.call(arguments, (err: Error, row: any) => {
        if (err) {
          return reject(err)
        }
        resolve(row)
      })
      this.obj.get.apply(this.obj, arguments)
    })
  }

  allAsync(sql: string, ...params: any[]): Promise<any[]>
  allAsync() {
    return new Promise((resolve, reject) => {
      Array.prototype.push.call(arguments, (err: Error, rows: any[]) => {
        if (err) {
          return reject(err)
        }
        resolve(rows)
      })
      this.obj.all.apply(this.obj, arguments)
    })
  }

  eachAsync(sql: string, ...params: any[]): Promise<number>
  eachAsync() {
    return new Promise((resolve, reject) => {
      let cb: RowFunction | undefined
      if (arguments.length > 0 && isFunction(arguments[arguments.length - 1])) {
        cb = Array.prototype.pop.call(arguments)
      }
      Array.prototype.push.call(arguments, (err: Error, row: any) => {
        if (err) {
          return reject(err)
        }
        if (cb) {
          cb(row)
        }
      })
      Array.prototype.push.call(arguments, (err: Error, numRows: number) => {
        if (err) {
          return reject(err)
        }
        resolve(numRows)
      })
      this.obj.each.apply(this.obj, arguments)
    })
  }

  execAsync(sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.obj.exec(sql, (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  prepareAsync(sql: string, ...params: any[]): Promise<Statement>
  prepareAsync() {
    return new Promise((resolve, reject) => {
      Array.prototype.push.call(arguments, callback)
      let stmt = new Statement(this.obj.prepare.apply(this.obj, arguments))
      function callback(err: Error) {
        if (err) {
          return reject(err)
        }
        resolve(stmt)
      }
    })
  }

  close() {
    return this.obj.close.apply(this.obj, arguments)
  }

  run() {
    return this.obj.run.apply(this.obj, arguments)
  }

  get() {
    return this.obj.get.apply(this.obj, arguments)
  }

  all() {
    return this.obj.all.apply(this.obj, arguments)
  }

  each() {
    return this.obj.each.apply(this.obj, arguments)
  }

  exec() {
    return this.obj.exec.apply(this.obj, arguments)
  }

  prepare() {
    return this.obj.prepare.apply(this.obj, arguments)
  }

  on() {
    return this.obj.on.apply(this.obj, arguments)
  }

  removeListener() {
    return this.obj.removeListener.apply(this.obj, arguments)
  }

  removeAllListeners() {
    return this.obj.removeAllListeners.apply(this.obj, arguments)
  }
}
