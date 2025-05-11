type Distribucion = "binomial" | "hipergeometrica" | "poisson";
import { Decimal } from "decimal.js";
const distSelect = document.getElementById("dis-select") as HTMLSelectElement;
const decimalsInput = document.getElementById("decimals") as HTMLInputElement;
const BinomialApp = document.getElementById("binomial" as Distribucion)!;
const PoissonApp = document.getElementById("poisson" as Distribucion)!;
const HiperApp = document.getElementById("hipergeometrica" as Distribucion)!;
const result = document.getElementById("result") as HTMLParagraphElement;
const form = document.getElementById("form") as HTMLParagraphElement;
const errors = document.getElementById("errors") as HTMLParagraphElement;
const formulas: Record<Distribucion, string> = {
  binomial: `
    \\[
      P(X = k) = \\binom{n}{k} \\cdot p^k \\cdot (1 - p)^{n - k}
    \\]
  `,
  hipergeometrica: `
    \\[
      P(X = k) = \\frac{\\binom{K}{k} \\cdot \\binom{N - K}{n - k}}{\\binom{N}{n}}
    \\]
  `,
  poisson: `
    \\[
      P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}
    \\]
  `,
};

let selectedVal: Distribucion = "binomial";
const setSelectedVal = (val: Distribucion) => {
  errors.innerHTML = "";
  result.innerHTML = "";
  selectedVal = val;

  BinomialApp.classList.toggle("hidden", selectedVal !== "binomial");
  HiperApp.classList.toggle("hidden", selectedVal !== "hipergeometrica");
  PoissonApp.classList.toggle("hidden", selectedVal !== "poisson");

  form.innerHTML = formulas[selectedVal];

  (window as any).MathJax.typesetPromise();
};
setSelectedVal("binomial");
distSelect?.addEventListener("change", () => {
  setSelectedVal(distSelect.value as Distribucion);
});

const bnInput = document.getElementById("bn") as HTMLInputElement;
const bpInput = document.getElementById("bp") as HTMLInputElement;
const bkInput = document.getElementById("bk") as HTMLInputElement;
const bBtn = document.getElementById("bbtn");

bBtn?.addEventListener("click", () => {
  errors.innerHTML = "";
  result.innerHTML = "";
  const one = new Decimal(1);

  try {
    const errorMessages: string[] = [];
    if (bnInput.value.trim() === "") {
      errorMessages.push(`\\text{Ingrese } n `);
    }
    if (bkInput.value.trim() === "") {
      errorMessages.push(`\\text{Ingrese } k `);
    }
    if (bpInput.value.trim() === "") {
      errorMessages.push(`\\text{Ingrese } p `);
    }
    if (errorMessages.length > 0) {
      errors.innerHTML = `
  \\[
    \\begin{align*}
      ${errorMessages.map((msg) => `${msg} \\\\`).join("\n")}
    \\end{align*}
  \\]
`;
      (window as any).MathJax.typesetPromise();
      return;
    }
    const n = new Decimal(bnInput.value);
    const k = new Decimal(bkInput.value);
    const p = new Decimal(bpInput.value);

    if (!n.isInteger() || n.isNegative()) {
      errorMessages.push(`n \\text{ debe ser un entero no negativo}`);
    }

    if (!k.isInteger() || k.isNegative() || k.gt(n)) {
      errorMessages.push(
        `k \\text{ debe ser un entero entre } 0 \\text{ y } n`
      );
    }

    if (p.lt(0) || p.gt(1)) {
      errorMessages.push(`p \\text{ debe estar en el rango } [0, 1]`);
    }

    if (errorMessages.length > 0) {
      errors.innerHTML = `
  \\[
    \\begin{align*}
      ${errorMessages.map((msg) => `${msg} \\\\`).join("\n")}
    \\end{align*}
  \\]
`;
      (window as any).MathJax.typesetPromise();
      return;
    }

    const comb = factorial(n).div(factorial(k).mul(factorial(n.minus(k))));
    const pPart = p.pow(k);
    const qPart = one.minus(p).pow(n.minus(k));
    const prob = comb.mul(pPart).mul(qPart);

    const decimals = parseInt(decimalsInput.value) || 10;
    const latex = `\\[
      P(X = ${k}) = \\binom{${n}}{${k}} \\cdot ${p}^{${k}} \\cdot ${one.minus(
      p
    )}^{${n.minus(k)}} = ${prob.toFixed(decimals)}
    \\]`;

    result.innerHTML = latex;
    (window as any).MathJax.typesetPromise();
  } catch (e) {
    errors.innerHTML = `\\[\\text{Error: Entrada inválida}\\]`;
    (window as any).MathJax.typesetPromise();
  }
});

const plInput = document.getElementById("pl") as HTMLInputElement;
const pkInput = document.getElementById("pk") as HTMLInputElement;
const pBtn = document.getElementById("pbtn");

pBtn?.addEventListener("click", () => {
  errors.innerHTML = "";
  result.innerHTML = "";
  try {
    const errorMessages: string[] = [];

    if (plInput.value.trim() === "")
      errorMessages.push(`\\text{Ingrese un valor para } \\lambda`);
    if (pkInput.value.trim() === "")
      errorMessages.push(`\\text{Ingrese un valor para } k`);

    const lambda = new Decimal(plInput.value);
    const k = new Decimal(pkInput.value);

    if (lambda.isNegative())
      errorMessages.push(`\\lambda \\text{ debe ser } \\geq 0`);
    if (!k.isInteger() || k.isNegative())
      errorMessages.push(`k \\text{ debe ser un entero } \\geq 0`);

    if (errorMessages.length > 0) {
      errors.innerHTML = `
        \\[
          \\begin{align*}
            ${errorMessages.map((msg) => `${msg} \\\\`).join("\n")}
          \\end{align*}
        \\]
      `;
      (window as any).MathJax.typesetPromise();
      return;
    }

    const e = Decimal.exp(lambda.neg());
    const num = lambda.pow(k);
    const factK = factorial(k);
    const prob = e.mul(num).div(factK);

    const decimals = parseInt(decimalsInput.value) || 10;
    result.innerHTML = `\\[
      P(X = ${k}) = \\frac{e^{- ${lambda}} \\cdot ${lambda}^{${k}}}{${k}!} = ${prob.toFixed(
      decimals
    )}
    \\]`;
    (window as any).MathJax.typesetPromise();
  } catch {
    errors.innerHTML = `\\[\\text{Error: Entrada inválida}\\]`;
    (window as any).MathJax.typesetPromise();
  }
});

const hNInput = document.getElementById("hN") as HTMLInputElement;
const hKInput = document.getElementById("hK") as HTMLInputElement;
const hnInput = document.getElementById("hn") as HTMLInputElement;
const hkInput = document.getElementById("hk") as HTMLInputElement;
const hBtn = document.getElementById("hbtn");

hBtn?.addEventListener("click", () => {
  errors.innerHTML = "";
  result.innerHTML = "";

  try {
    const errorMessages: string[] = [];

    if (hNInput.value.trim() === "") errorMessages.push(`\\text{Ingrese } N`);
    if (hKInput.value.trim() === "") errorMessages.push(`\\text{Ingrese } K`);
    if (hnInput.value.trim() === "") errorMessages.push(`\\text{Ingrese } n`);
    if (hkInput.value.trim() === "") errorMessages.push(`\\text{Ingrese } k`);

    const N = new Decimal(hNInput.value);
    const K = new Decimal(hKInput.value);
    const n = new Decimal(hnInput.value);
    const k = new Decimal(hkInput.value);

    if (!N.isInteger() || N.lte(0))
      errorMessages.push(`N \\text{ debe ser un entero } > 0`);
    if (!K.isInteger() || K.lt(0) || K.gt(N))
      errorMessages.push(`K \\text{ debe estar en el rango } [0, N]`);
    if (!n.isInteger() || n.lt(0) || n.gt(N))
      errorMessages.push(`n \\text{ debe estar en el rango } [0, N]`);
    if (!k.isInteger() || k.lt(0) || k.gt(n) || k.gt(K))
      errorMessages.push(`k \\text{ debe estar en } [0, \\min(K, n)]`);

    if (errorMessages.length > 0) {
      errors.innerHTML = `
        \\[
          \\begin{align*}
            ${errorMessages.map((msg) => `${msg} \\\\`).join("\n")}
          \\end{align*}
        \\]
      `;
      (window as any).MathJax.typesetPromise();
      return;
    }

    const comb1 = factorial(K).div(factorial(k).mul(factorial(K.minus(k))));
    const comb2 = factorial(N.minus(K)).div(
      factorial(n.minus(k)).mul(factorial(N.minus(K).minus(n.minus(k))))
    );
    const combTotal = factorial(N).div(factorial(n).mul(factorial(N.minus(n))));
    const prob = comb1.mul(comb2).div(combTotal);

    const decimals = parseInt(decimalsInput.value) || 10;
    result.innerHTML = `\\[
      P(X = ${k}) = \\frac{\\binom{${K}}{${k}} \\cdot \\binom{${N.minus(
      K
    )}}{${n.minus(k)}}}{\\binom{${N}}{${n}}}
      = ${prob.toFixed(decimals)}
    \\]`;
    (window as any).MathJax.typesetPromise();
  } catch {
    errors.innerHTML = `\\[\\text{Error: Entrada inválida}\\]`;
    (window as any).MathJax.typesetPromise();
  }
});

const factorial = (x: Decimal): Decimal => {
  let result = new Decimal(1);
  for (let i = new Decimal(2); i.lte(x); i = i.plus(1)) {
    result = result.mul(i);
  }
  return result;
};
