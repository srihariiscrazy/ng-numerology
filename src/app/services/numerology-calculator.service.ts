
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NumerologyCalculatorService {

  private letterMap: Record<string, number> = {
    A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,J:1,K:2,L:3,M:4,N:5,O:7,P:8,Q:1,R:2,S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7
  };

  reduceToDigit(n: number): number {
    while (n > 9) {
      n = n.toString().split('').reduce((a,b)=>a + Number(b), 0);
    }
    return n;
  }

  getBirthNumber(date: Date): number {
    const day = date.getDate();
    return this.reduceToDigit(day);
  }

  getDestinyNumber(date: Date): number {
    const digits = date.getDate().toString().split('').concat(
      (date.getMonth()+1).toString().split(''),
      date.getFullYear().toString().split('')
    ).map(Number);
    return this.reduceToDigit(digits.reduce((a,b)=>a+b,0));
  }

  getDharmaArthaKama(date: Date) {
    const allDigits = date.getDate().toString().padStart(2,'0').split('')
      .concat((date.getMonth()+1).toString().padStart(2,'0').split(''))
      .concat(date.getFullYear().toString().split('')).map(Number);
    const counts: Record<number, number> = {};
    allDigits.forEach(d => counts[d] = (counts[d] || 0) + 1);
    const dharma = [3,1,9].map(n => ({n, count: counts[n]||0}));
    const artha  = [6,7,5].map(n => ({n, count: counts[n]||0}));
    const kama   = [2,8,4].map(n => ({n, count: counts[n]||0}));
    return { dharma, artha, kama };
  }

  getMindMaterial(name: string) {
    const letters = name.replace(/[^A-Za-z]/g,'').toUpperCase().split('');
    const vowels = letters.filter(l => 'AEIOU'.includes(l));
    const consonants = letters.filter(l => !'AEIOU'.includes(l));
    const vowelSum = vowels.map(v=>this.letterMap[v]||0).reduce((a,b)=>a+b,0);
    const consSum = consonants.map(c=>this.letterMap[c]||0).reduce((a,b)=>a+b,0);
    const mind = this.reduceToDigit(vowelSum);
    const material = this.reduceToDigit(consSum);
    const total = this.reduceToDigit(mind + material);
    return { vowels, consonants, vowelSum, consSum, mind, material, total };
  }

  getBirthYearCycles(birthYear: number, limit = 2100) {
    const cycles: Array<{ from: number; sum: number; next: number; currentAge: number; nextAge: number }> = [];
    let current = birthYear;
    while (current < limit) {
      const sum = current.toString().split('').reduce((a, b) => a + Number(b), 0);
      const next = current + sum;
      const currentAge = current - birthYear;
      const nextAge = next - birthYear;
      cycles.push({ from: current, sum, next, currentAge, nextAge });
      current = next;
    }
    return {
      birthYear,
      cycles,
      crucialYears: cycles.map(c => c.next)
    };
  }

  checkLateMarriage(dayDigit: number, monthDigit: number, yearDigit: number, lateMarriageNumbers: number[]): boolean {
    const digits = [dayDigit, monthDigit, yearDigit];
    const lateMarriageCount = digits.filter(digit => lateMarriageNumbers.includes(digit)).length;
    return lateMarriageCount >= 2;
  }

  getApproximateMarriageYears(dob: Date, favs:any, lateMarriageNumbers: number[]) {
    const day = dob.getDate();
    const year = dob.getFullYear();
    const startYear = year + 20;
    const endYear = year + 50;
    const years: {year: number; sum: number; match: boolean}[] = [];

    for (let y = startYear; y <= endYear; y++) {
      const sum = y.toString().split('').reduce((a,b)=>a+ +b,0);
      const reduced = this.reduceToDigit(sum);
      years.push({ year: y, sum: reduced, match: favs.includes(reduced) });
    }

    const matchingYears = years.filter(y => y.match).map(y => y.year);
    const lateOrTroubleInMarriage = this.checkLateMarriage(
      this.reduceToDigit(day),
      this.reduceToDigit(dob.getMonth() + 1),
      this.reduceToDigit(year),
      lateMarriageNumbers
    );
    return { favDigits: favs, matchingYears,lateOrTroubleInMarriage };
  }

  // Get all individual digits from DOB
  private getAllDigits(dob:Date): number[] {
    const day = dob.getDate().toString().padStart(2,'0');
    const month = (dob.getMonth()+1).toString().padStart(2,'0');
    const year = dob.getFullYear().toString();
    const dobString = `${day}${month}${year}`;
    return dobString.split('').map(digit => +digit);
  }

  // Check Lo Shu Grid combinations
  checkLoShuCombinations(dob: Date,loShuCombinations:{ pair: number[]; description: string }[]): { pair: number[]; description: string }[] {
    const allDigits = this.getAllDigits(dob); 
    return loShuCombinations.filter(combo => 
      combo.pair.every(num => allDigits.includes(num))
    );
  }



}
