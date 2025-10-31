// ...existing code...
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumerologyCalculatorService } from '../services/numerology-calculator.service';
import { PdfService } from '../services/pdf.service';
import * as numberVibration from '../../assets/data/number-vibrations.json';
import * as weekdayMap from '../../assets/data/weekday-results.json';
import * as healthResults from '../../assets/data/health-results.json';
import * as plotDoorData from '../../assets/data/plot-door.json';
import * as rulingPlanet from '../../assets/data/ruling-planet.json';
import * as matchingTable from '../../assets/data/matching-table.json';
import * as weddingTable from '../../assets/data/wedding-table.json';
import * as monthPredictions from '../../assets/data/month-predictions.json';
import * as raashiElements from '../../assets/data/raashi-elements.json';
import * as stabilityAge from '../../assets/data/stability-age.json';
import * as yearPredictions from '../../assets/data/year-predictions.json';
import * as loShuData from '../../assets/data/lo-shu-grid-combinations.json';
import * as mindMaterialData from '../../assets/data/mind-material-result.json';
import * as horaToBeUsed from '../../assets/data/hora-to-be-used.json';
import * as firstLetterSignificance from '../../assets/data/first-letter-significance.json';
@Component({
  selector: 'app-numerology-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./numerology-form.component.html',
  styles: [``]
})
export class NumerologyFormComponent implements OnInit {
  name = 'Srihari K';
  dob = '1991-08-13';
  plots = '43,74';
  door = '63';
  result: any;
  numberVibration: any;
  weekdayText = '';
  healthResult: any;
  plotDoorData: any;
  weekdayMap: any;
  healthResults: any;
  rulingPlanet: any;
  birthYearCycle: any;
  matchingTable: any;
  weddingTable: any;
  monthPredictions: any;
  yearPredictions: any;
  raashiElements: any;
  raashiElementKey: string | null = null;
  raashiElementDetails: any = null;
  stabilityAges: any;
  stabilityAgeForBirth: number[] | null = null;

  // added fields to hold calculation steps (string steps for full trace)
  birthCalc: { steps: string[]; final: number } | null = null;
  destinyCalc: { steps: string[]; final: number } | null = null;

  // new: prepared rows for rendering dharma/artha/kama
  dakRows: { raw?: Array<{n:number,count:number}>; type: string; desc: string; formatted?: string }[] = [];
  matchingResult: any;
  weddingResult: any;
  monthResult: any;
  yearResult: any;
  compatilePartnerMonths: any;
  loShuData:any;
  horaToBeUsed: any;
  horaForBirth: { auspicious: string[]; average: string[]; inauspicious: string[] } | null = null;
  mindMaterialMap: any;
  mindEntry: any | null = null;
  materialEntry: any | null = null;
  firstLetterMap: any;
  firstLetterKey: string | null = null;
  firstLetterDesc: string | null = null;
  loShuResults:any;
  mindMaterialTotal: any;

  constructor(private calc: NumerologyCalculatorService, private pdf: PdfService) {}

  async ngOnInit() {
    // fetch external json data
    this.numberVibration = numberVibration;
    this.weekdayMap = weekdayMap
    this.healthResults = healthResults;
    this.plotDoorData = plotDoorData;
    this.rulingPlanet = rulingPlanet;
    this.matchingTable = matchingTable;
    this.weddingTable = weddingTable;
    this.monthPredictions = monthPredictions;
    this.yearPredictions = yearPredictions;
    this.raashiElements = raashiElements;
    this.stabilityAges = stabilityAge;
    this.loShuData = loShuData;
    this.horaToBeUsed = horaToBeUsed;
    this.mindMaterialMap = mindMaterialData;
    this.firstLetterMap = firstLetterSignificance;
  }

  // format hora arrays safely
  formatHoraList(arr: string[] | undefined): string {
    if (!arr || !arr.length) return '-';
    return arr.join(', ');
  }

    // helper to show repeated numbers (keeps duplicates adjacent and sorted 1..9)
  formatNums(nums: number[]): string {
    if (!nums || !nums.length) return '';
    const counts: Record<number, number> = {};
    nums.forEach(n => {
      if (!isNaN(n)) counts[n] = (counts[n] || 0) + 1;
    });
    const ordered: string[] = [];
    for (let i = 1; i <= 9; i++) {
      if (counts[i]) {
        for (let j = 0; j < counts[i]; j++) ordered.push(String(i));
      }
    }
    return ordered.join('   ');
  }

  // Build counts for digits (1..9) from the mm (mind/material) object
  private buildNumberCountsFromMM(mm: any): Record<number, number> {
    const counts: Record<number, number> = {};
    if (!mm) return counts;
    const collect = (val: any) => {
      if (val == null) return;
      if (Array.isArray(val)) { val.forEach(v => collect(v)); return; }
      if (typeof val === 'number' && !isNaN(val)) { counts[val] = (counts[val] || 0) + 1; return; }
      if (typeof val === 'string') {
        const matches = val.match(/\d/g);
        if (matches) matches.forEach(d => { const n = Number(d); counts[n] = (counts[n] || 0) + 1; });
        return;
      }
      if (typeof val === 'object') {
        for (const k of Object.keys(val)) if (/^\d$/.test(k)) { const n = Number(k); counts[n] = (counts[n] || 0) + 1; }
        for (const v of Object.values(val)) collect(v);
      }
    };
    // inspect typical mm properties first
    const props = ['vowelMapping','consMapping','vowels','consonants','mapping','mapped','letters','numbers'];
    for (const p of props) if (mm[p]) collect(mm[p]);
    // fallback: scan whole object
    for (const v of Object.values(mm)) collect(v);
    return counts;
  }

  // helper to reduce a numeric string to single digit showing steps (returns textual steps)
  private reduceDigitsFromString(s: string, singleStep = false): { steps: string[]; final: number } {
    const digits = s.replace(/[^0-9]/g, '').split('').map(d => Number(d)).filter(n => !isNaN(n));
    const steps: string[] = [];
    if (digits.length === 0) return { steps: [], final: 0 };
    let currentSum = digits.reduce((a, b) => a + b, 0);
    steps.push(`${digits.join('+')}=${currentSum}`);
    if(singleStep) return { steps, final: currentSum };
    while (currentSum > 9) {
      const parts = ('' + currentSum).split('').map(ch => Number(ch));
      const next = parts.reduce((a, b) => a + b, 0);
      steps.push(`${parts.join('+')}=${next}`);
      currentSum = next;
    }
    return { steps, final: currentSum };
  }

  // Parse a range like "21 March - 20 April" into numeric keys
  private parseRange(rangeStr: string) {
    // month name -> month index (1..12)
    const monthMap: Record<string, number> = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
    };
    const parts = rangeStr.split('-').map(p => p.trim());
    if (parts.length !== 2) return null;
    const startParts = parts[0].split(' ').filter(Boolean);
    const endParts = parts[1].split(' ').filter(Boolean);
    const startDay = Number(startParts[0]);
    const startMonth = monthMap[startParts.slice(1).join(' ').toLowerCase()];
    const endDay = Number(endParts[0]);
    const endMonth = monthMap[endParts.slice(1).join(' ').toLowerCase()];
    if (!startMonth || !endMonth || isNaN(startDay) || isNaN(endDay)) return null;
    const startKey = startMonth * 100 + startDay;
    const endKey = endMonth * 100 + endDay;
    return { startKey, endKey };
  }

  // returns element key like 'fire'|'earth'|'air'|'water' or null
  private getElementForDate(date: Date): string | null {
    if (!this.raashiElements) return null;
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const key = m * 100 + d;
    for (const elemKey of Object.keys(this.raashiElements)) {
      const entry = this.raashiElements[elemKey];
      if (!entry || !Array.isArray(entry.ranges)) continue;
      for (const range of entry.ranges) {
        const parsed = this.parseRange(range);
        if (!parsed) continue;
        const { startKey, endKey } = parsed;
        if (startKey <= endKey) {
          if (key >= startKey && key <= endKey) return elemKey;
        } else {
          // range wraps year end (e.g., 21 Dec - 20 Jan)
          if (key >= startKey || key <= endKey) return elemKey;
        }
      }
    }
    return null;
  }

  async calculate() {
    const dateObj = new Date(this.dob);
    const birth = this.calc.getBirthNumber(dateObj);
    const destiny = this.calc.getDestinyNumber(dateObj);
    const dak = this.calc.getDharmaArthaKama(dateObj);
    const mm = this.calc.getMindMaterial(this.name);

    // build calculation steps for birth (day of month) and destiny (digits of day+month+year)
    const dayStr = String(dateObj.getDate());
    const birthTrace = this.reduceDigitsFromString(dayStr);
    this.birthCalc = { steps: birthTrace.steps, final: birthTrace.final };

    const fullDateDigits = `${dateObj.getDate()}${dateObj.getMonth() + 1}${dateObj.getFullYear()}`;
    const destinyTrace = this.reduceDigitsFromString(fullDateDigits);
    this.destinyCalc = { steps: destinyTrace.steps, final: destinyTrace.final };

    this.weekdayText = this.weekdayMap[new Date(this.dob).toLocaleString('en-US', {weekday:'long'})];
    this.numberVibration = this.numberVibration || {};
    // keep service output and also compute a reduction trace for the year
    this.birthYearCycle = this.calc.getBirthYearCycles(dateObj.getFullYear());
    this.birthYearCycle.cycles.forEach((cycle: { from: any; calculation: { year: any; steps: string[]; final: number; }; }) => {
      const yearTrace = this.reduceDigitsFromString(String(cycle.from),true);
      cycle.calculation = { year: cycle.from, steps: yearTrace.steps, final: yearTrace.final };
    });

    this.healthResult = this.healthResults.healthMap[birth] || null;

    this.matchingResult = this.matchingTable[birth] || null;
    this.weddingResult = this.calc.getApproximateMarriageYears(dateObj,this.weddingTable.weddingYearMap[birth],this.weddingTable.lateMarriageNumbers);
    const monthName = new Date(this.dob).toLocaleString('en-US', { month: 'long' });
    this.compatilePartnerMonths = this.weddingTable.compatiblePartnerMonth[monthName] || [];  

    this.monthResult = this.monthPredictions[monthName] || null;

    this.yearResult = this.yearPredictions[''+this.reduceDigitsFromString(dateObj.getFullYear()+'').final] || null;

    // Check Lo Shu Grid combinations
    this.loShuResults = this.calc.checkLoShuCombinations(dateObj, this.loShuData.combinations );
      
  // compute raashi element from dob
  const elem = this.getElementForDate(dateObj);
  this.raashiElementKey = elem;
  this.raashiElementDetails = elem ? (this.raashiElements[elem] || null) : null;
  console.log('raashi element', this.raashiElementKey, this.raashiElementDetails);
  // stability ages for birth number
  this.stabilityAgeForBirth = this.stabilityAges ? (this.stabilityAges[''+birth] || null) : null;
  // hora mapping for ruling number (use birth number as ruling number)
  this.horaForBirth = this.horaToBeUsed ? (this.horaToBeUsed[''+birth] || null) : null;
    // first-letter significance for the provided name
    try {
      const firstCharMatch = (this.name || '').trim().match(/[A-Za-z]/);
      const firstChar = firstCharMatch ? firstCharMatch[0].toUpperCase() : null;
      this.firstLetterKey = firstChar;
      this.firstLetterDesc = firstChar && this.firstLetterMap ? (this.firstLetterMap[firstChar]?.description || null) : null;
    } catch (e) {
      this.firstLetterKey = null;
      this.firstLetterDesc = null;
    }
  // helper to convert various formats into number array and keep a raw fallback
    const toNumArrayWithRaw = (v: any) => {
      const raw = v ?? '';

      const extractNumber = (item: any): number | null => {
        if (item == null) return null;
        if (typeof item === 'number' && !isNaN(item)) return item;
        if (typeof item === 'string') {
          const s = item.trim();
          if (/^\d+$/.test(s)) return Number(s);
          const m = s.match(/\d+/);
          if (m) return Number(m[0]);
          return null;
        }
        if (typeof item === 'object') {
          // 1) numeric keys like { "3": true }
          for (const k of Object.keys(item)) {
            if (/^\d+$/.test(k)) return Number(k);
          }
          // 2) numeric values like { num: 3 } or { value: "3" }
          for (const val of Object.values(item)) {
            if (typeof val === 'number' && !isNaN(val)) return val as number;
            if (typeof val === 'string' && /^\d+$/.test(val.trim())) return Number((val as string).trim());
          }
          // 3) fallback: stringify and pick first digit sequence
          try {
            const s = JSON.stringify(item);
            const m = s.match(/\d+/);
            if (m) return Number(m[0]);
          } catch (e) { /* ignore */ }
        }
        return null;
      };

      // array of possibly objects/strings/numbers
      if (Array.isArray(v)) {
        const nums = v
          .map((it: any) => extractNumber(it))
          .filter((n: number | null) => n !== null) as number[];
        return { nums, raw: JSON.stringify(v) };
      }

      if (typeof v === 'number') return { nums: [v], raw: String(v) };
      const s = String(v || '').trim();
      if (!s) return { nums: [], raw: '' };

      // allow comma separated, space separated, or continuous digits
      const cleaned = s.replace(/[^\d, ]/g, '');
      let parts: string[] = [];
      if (cleaned.includes(',')) parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
      else if (cleaned.includes(' ')) parts = cleaned.split(' ').map(p => p.trim()).filter(Boolean);
      else parts = cleaned.split('').map(ch => ch.trim()).filter(Boolean);

      const nums = parts.map(p => Number(p)).filter(n => !isNaN(n));
      return { nums, raw: s };
    };

    const makeFormatted = ( raw: Array<{n:number,count:number}>) => {
      return raw.map(item => item.n + '(' + item.count + ')').join(' ');
    };

    this.dakRows = [
      { raw: dak.dharma, formatted: makeFormatted(dak.dharma), type: 'DHARMA / SATWA', desc: 'Focus on Rightful Duty.' },
      { raw: dak.artha, formatted: makeFormatted(dak.artha), type: 'ARTHA / RAJAS', desc: 'Focus on Material, Prosperity and Wealth.' },
      { raw: dak.kama, formatted: makeFormatted(dak.kama), type: 'KAMA / TAMAS', desc: 'Focus on Fulfilling Self Desires.' }
    ];

    // populate mind/material lookup entries from mind-material-result.json
    try {
      this.mindEntry = (this.mindMaterialMap && mm && mm.mind) ? (this.mindMaterialMap['' + mm.mind] || null) : null;
      this.materialEntry = (this.mindMaterialMap && mm && mm.material) ? (this.mindMaterialMap['' + mm.material] || null) : null;
      this.mindMaterialTotal = (mm && mm.total) ? (this.mindMaterialMap['' + mm.total] || null) : null;
    } catch (e) {
      this.mindEntry = null;
      this.materialEntry = null;
      this.mindMaterialTotal = null;
    }

    // plots: build complete trace for each plot string
    const plotArr = this.plots.split(',').map(p=>p.trim()).filter(Boolean).map(p=>{
      const digits = p.replace(/[^0-9]/g,'').split('').map(d => Number(d)).filter(n=>!isNaN(n));
      const sum = digits.reduce((a,b)=>a+Number(b),0);
      const steps: string[] = [];
      if (digits.length) {
        steps.push(`${digits.join('+')}=${sum}`);
        let cur = sum;
        while (cur > 9) {
          const parts = (''+cur).split('').map(ch => Number(ch));
          const next = parts.reduce((a,b)=>a+b,0);
          steps.push(`${parts.join('+')}=${next}`);
          cur = next;
        }
      }
      const reduced = (steps.length ? Number(steps[steps.length-1].split('=')[1]) : 0);
      const text = this.plotDoorData.plots[''+reduced] || 'Generic plot result';
      return {plot:p, digits, sum, steps, reduced, text};
    });

    // door: full trace
    const doorDigits = this.door.replace(/[^0-9]/g,'').split('').map(d=>Number(d)).filter(n=>!isNaN(n));
    const doorSum = doorDigits.reduce((a,b)=>a+Number(b),0);
    const doorSteps: string[] = [];
    if (doorDigits.length) {
      doorSteps.push(`${doorDigits.join('+')}=${doorSum}`);
      let cur = doorSum;
      while (cur > 9) {
        const parts = (''+cur).split('').map(ch => Number(ch));
        const next = parts.reduce((a,b)=>a+b,0);
        doorSteps.push(`${parts.join('+')}=${next}`);
        cur = next;
      }
    }
    const doorReduced = doorSteps.length ? Number(doorSteps[doorSteps.length-1].split('=')[1]) : 0;
    const doorResText = this.plotDoorData.doors[''+doorReduced] || 'Door generic';
    const doorRes = {digits: doorDigits, sum: doorSum, steps: doorSteps, reduced:doorReduced, text:doorResText};

    // attach calculation traces into result so template can show them
    this.result = { birth, destiny, dak, mm, plotResults: plotArr, doorRes };
  }

  exportPdf() {
    if (!this.result) { alert('Calculate first'); return; }
    const sections = [
      { heading: 'Core', body: `DOB: ${this.dob}\nBirth: ${this.result.birth}\nDestiny: ${this.result.destiny}\nBirth calc: ${this.birthCalc?.steps.join(' → ')} → ${this.birthCalc?.final}\nDestiny calc: ${this.destinyCalc?.steps.join(' → ')} → ${this.destinyCalc?.final}` },
      { heading: 'Dharma/Artha/Kama', body: JSON.stringify(this.result.dak, null, 2) },
      { heading: 'Mind/Material', body: `Vowels: ${this.result.mm.vowels?.join(', ') || ''} (sum ${this.result.mm.vowelSum}) → Mind ${this.result.mm.mind}\nConsonants: ${this.result.mm.consonants?.join(', ') || ''} (sum ${this.result.mm.consSum}) → Material ${this.result.mm.material}\nTotal: ${this.result.mm.total}` },
    ];
    const doc = this.pdf.generateSimplePdf('Numerology Report', sections);
    doc.save('numerology-report.pdf');
  }
}
// ...existing code...