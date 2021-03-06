// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class StopLoss extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save StopLoss entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save StopLoss entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("StopLoss", id.toString(), this);
  }

  static load(id: string): StopLoss | null {
    return store.get("StopLoss", id) as StopLoss | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get orderNumber(): BigInt {
    let value = this.get("orderNumber");
    return value.toBigInt();
  }

  set orderNumber(value: BigInt) {
    this.set("orderNumber", Value.fromBigInt(value));
  }

  get uniPair(): Bytes {
    let value = this.get("uniPair");
    return value.toBytes();
  }

  set uniPair(value: Bytes) {
    this.set("uniPair", Value.fromBytes(value));
  }

  get orderer(): Bytes {
    let value = this.get("orderer");
    return value.toBytes();
  }

  set orderer(value: Bytes) {
    this.set("orderer", Value.fromBytes(value));
  }

  get delegated(): boolean {
    let value = this.get("delegated");
    return value.toBoolean();
  }

  set delegated(value: boolean) {
    this.set("delegated", Value.fromBoolean(value));
  }

  get lpAmount(): BigInt {
    let value = this.get("lpAmount");
    return value.toBigInt();
  }

  set lpAmount(value: BigInt) {
    this.set("lpAmount", Value.fromBigInt(value));
  }

  get tokenIn(): BigInt {
    let value = this.get("tokenIn");
    return value.toBigInt();
  }

  set tokenIn(value: BigInt) {
    this.set("tokenIn", Value.fromBigInt(value));
  }

  get tokenToGuarantee(): Bytes {
    let value = this.get("tokenToGuarantee");
    return value.toBytes();
  }

  set tokenToGuarantee(value: Bytes) {
    this.set("tokenToGuarantee", Value.fromBytes(value));
  }

  get amountToGuarantee(): BigInt {
    let value = this.get("amountToGuarantee");
    return value.toBigInt();
  }

  set amountToGuarantee(value: BigInt) {
    this.set("amountToGuarantee", Value.fromBigInt(value));
  }

  get ratio(): BigInt {
    let value = this.get("ratio");
    return value.toBigInt();
  }

  set ratio(value: BigInt) {
    this.set("ratio", Value.fromBigInt(value));
  }

  get status(): string {
    let value = this.get("status");
    return value.toString();
  }

  set status(value: string) {
    this.set("status", Value.fromString(value));
  }

  get amountWithdrawn(): BigInt | null {
    let value = this.get("amountWithdrawn");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set amountWithdrawn(value: BigInt | null) {
    if (value === null) {
      this.unset("amountWithdrawn");
    } else {
      this.set("amountWithdrawn", Value.fromBigInt(value as BigInt));
    }
  }

  get liquidator(): Bytes | null {
    let value = this.get("liquidator");
    if (value === null) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set liquidator(value: Bytes | null) {
    if (value === null) {
      this.unset("liquidator");
    } else {
      this.set("liquidator", Value.fromBytes(value as Bytes));
    }
  }

  get tokenToLiquidator(): Bytes | null {
    let value = this.get("tokenToLiquidator");
    if (value === null) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set tokenToLiquidator(value: Bytes | null) {
    if (value === null) {
      this.unset("tokenToLiquidator");
    } else {
      this.set("tokenToLiquidator", Value.fromBytes(value as Bytes));
    }
  }

  get amountToLiquidator(): BigInt | null {
    let value = this.get("amountToLiquidator");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set amountToLiquidator(value: BigInt | null) {
    if (value === null) {
      this.unset("amountToLiquidator");
    } else {
      this.set("amountToLiquidator", Value.fromBigInt(value as BigInt));
    }
  }
}

export class PoolStatus extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PoolStatus entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PoolStatus entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PoolStatus", id.toString(), this);
  }

  static load(id: string): PoolStatus | null {
    return store.get("PoolStatus", id) as PoolStatus | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timeStamp(): BigInt {
    let value = this.get("timeStamp");
    return value.toBigInt();
  }

  set timeStamp(value: BigInt) {
    this.set("timeStamp", Value.fromBigInt(value));
  }

  get priceA(): BigInt {
    let value = this.get("priceA");
    return value.toBigInt();
  }

  set priceA(value: BigInt) {
    this.set("priceA", Value.fromBigInt(value));
  }

  get ratioA(): BigInt {
    let value = this.get("ratioA");
    return value.toBigInt();
  }

  set ratioA(value: BigInt) {
    this.set("ratioA", Value.fromBigInt(value));
  }

  get ratioB(): BigInt {
    let value = this.get("ratioB");
    return value.toBigInt();
  }

  set ratioB(value: BigInt) {
    this.set("ratioB", Value.fromBigInt(value));
  }
}
