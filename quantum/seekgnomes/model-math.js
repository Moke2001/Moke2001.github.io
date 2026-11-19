// Scientific notation only. No DOM, network, library imports or task mutation.
// h0 is finite; the displayed infinite H is a formal interaction family.
const T = String.raw;

function rational(value) {
  const match = String(value).match(/^([+-]?\d+)(?:\/(\d+))?$/);
  if (!match) throw new TypeError(`Non-rational coefficient: ${value}`);
  let numerator = BigInt(match[1]);
  const denominator = BigInt(match[2] || '1');
  if (denominator === 0n) throw new RangeError('Zero denominator');
  const negative = numerator < 0n;
  if (negative) numerator = -numerator;
  return {negative, zero: numerator === 0n, one: numerator === denominator,
    magnitude: denominator === 1n ? String(numerator) : T`\frac{${numerator}}{${denominator}}`};
}

export function rationalLatex(value) {
  const n = rational(value);
  return `${n.negative ? '-' : ''}${n.magnitude}`;
}

function offset(cell) {
  let value = '';
  cell.forEach((coordinate, axis) => {
    if (!coordinate) return;
    const amount = Math.abs(coordinate);
    value += `${coordinate < 0 ? '-' : value ? '+' : ''}${amount === 1 ? '' : amount}${T`\mathbf e_{${axis + 1}}`}`;
  });
  return value || T`\mathbf0`;
}

function position(cell, translated) {
  const delta = offset(cell);
  if (!translated) return delta;
  if (delta === T`\mathbf0`) return T`\mathbf r`;
  return `${T`\mathbf r`}${delta.startsWith('-') ? '' : '+'}${delta}`;
}

function siteLatex(cell, qubit, q, translated = false) {
  return `${position(cell, translated)}${q > 1 ? `,${qubit}` : ''}`;
}

function pauliProduct(word, q, translated = false) {
  if (!word.length) return T`\hat I`;
  return word.map(factor => T`\hat ${factor.pauli}_{${siteLatex(factor.cell, factor.qubit, q, translated)}}`).join(T`\,`);
}

function exactDensity(terms, q, translated = false) {
  let expression = '';
  terms.forEach(term => {
    const coefficient = rational(term.coefficient);
    if (coefficient.zero) return;
    const sign = coefficient.negative ? '-' : expression ? '+' : '';
    const amount = coefficient.one ? '' : coefficient.magnitude + T`\,`;
    expression += sign + amount + pauliProduct(term.word, q, translated);
  });
  return expression || '0';
}

function parametersLatex(parameters = {}) {
  const keys = {J1:'J_1', J2:'J_2', Jx:'J_x', Jy:'J_y', Jz:'J_z', Jperp:T`J_\perp`,
    Jparallel:T`J_\parallel`, JD:'J_D', Jd:'J_d', Jprime:T`J'`, Jchi:T`J_\chi`,
    Kx:'K_x', Ky:'K_y', Kz:'K_z', JX:'J_X', JZ:'J_Z', Je:'J_e', Jm:'J_m', Jc:'J_c', Jv:'J_v',
    lambda:T`\lambda`, Gamma:T`\Gamma`};
  return Object.entries(parameters).map(([key, value]) => `${keys[key] || key}=${rationalLatex(value)}`).join(T`,\quad `);
}

const SPIN = T`\hat{\boldsymbol S}_i=\frac12(\hat X_i,\hat Y_i,\hat Z_i),\qquad \hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j=\frac14(\hat X_i\hat X_j+\hat Y_i\hat Y_j+\hat Z_i\hat Z_j)`;
const PROJECTOR = T`\hat P_{ij}=\frac14\hat I-\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j`;
const BONDS = T`\langle ij\rangle\ \text{counts each undirected nearest-neighbor bond once}`;
const PAULI = T`\hat\sigma_i^x=\hat X_i,\quad\hat\sigma_i^y=\hat Y_i,\quad\hat\sigma_i^z=\hat Z_i`;

const FORMULAS = {
  '01': {hamiltonian:T`\hat H=-J\sum_i\hat Z_i\hat Z_{i+1}-g\sum_i\hat X_i`, localDensity:T`\hat h_0=-J\hat Z_0\hat Z_1-g\hat X_0`},
  '02': {hamiltonian:T`\hat H=-J\sum_i\hat Z_i\hat Z_{i+1}-g\sum_i\hat X_i-h\sum_i\hat Z_i`, localDensity:T`\hat h_0=-J\hat Z_0\hat Z_1-g\hat X_0-h\hat Z_0`},
  '03': {hamiltonian:T`\hat H=-J_1\sum_i\hat Z_i\hat Z_{i+1}+J_2\sum_i\hat Z_i\hat Z_{i+2}-g\sum_i\hat X_i`, localDensity:T`\hat h_0=-J_1\hat Z_0\hat Z_1+J_2\hat Z_0\hat Z_2-g\hat X_0`},
  '04': {hamiltonian:T`\hat H=-\sum_i\left(J_x\hat X_i\hat X_{i+1}+J_y\hat Y_i\hat Y_{i+1}\right)-h\sum_i\hat Z_i`},
  '05': {hamiltonian:T`\hat H=\sum_i\left[J_\perp\left(\hat X_i\hat X_{i+1}+\hat Y_i\hat Y_{i+1}\right)+J_z\hat Z_i\hat Z_{i+1}\right]-h\sum_i\hat Z_i`, definitions:[PAULI]},
  '06': {hamiltonian:T`\hat H=\sum_i\left(J_x\hat X_i\hat X_{i+1}+J_y\hat Y_i\hat Y_{i+1}+J_z\hat Z_i\hat Z_{i+1}\right)`, definitions:[PAULI]},
  '07': {hamiltonian:T`\hat H=\sum_i\left[J_1\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_{i+1}+J_2\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_{i+2}\right]`, definitions:[SPIN]},
  '08': {hamiltonian:T`\hat H=-K\sum_i\hat Z_{i-1}\hat X_i\hat Z_{i+1}`, localDensity:T`\hat h_0=-K\hat Z_{-1}\hat X_0\hat Z_1`},
  '09': {hamiltonian:T`\hat H=-K\sum_i\hat X_{i-1}\hat Z_i\hat X_{i+1}+\lambda\sum_i\hat Y_i\hat Y_{i+1}`},
  '10': {hamiltonian:T`\hat H=-J_x\sum_n\hat X_{2n}\hat X_{2n+1}-J_z\sum_n\hat Z_{2n+1}\hat Z_{2n+2}`, definitions:[T`\text{Physical site }2n+\alpha\longleftrightarrow(n,\alpha),\qquad\alpha\in\{0,1\}`]},
  '11': {hamiltonian:T`\hat H=-J\sum_i\hat P_{i,i+1}-Q\sum_i\hat P_{i,i+1}\hat P_{i+2,i+3}`, definitions:[PROJECTOR,SPIN]},
  '12': {hamiltonian:T`\hat H=J_\parallel\sum_{n,\alpha=0,1}\hat{\boldsymbol S}_{n,\alpha}\!\cdot\!\hat{\boldsymbol S}_{n+1,\alpha}+J_\perp\sum_n\hat{\boldsymbol S}_{n,0}\!\cdot\!\hat{\boldsymbol S}_{n,1}`, definitions:[SPIN]},
  '13': {hamiltonian:T`\hat H=-J\sum_{\langle ij\rangle}\hat Z_i\hat Z_j-g\sum_i\hat X_i`, localDensity:T`\hat h_{\mathbf0}=-J\sum_{\mu=1}^{2}\hat Z_{\mathbf0}\hat Z_{\mathbf e_\mu}-g\hat X_{\mathbf0}`, definitions:[BONDS]},
  '14': {hamiltonian:T`\hat H=J\sum_{\langle ij\rangle}\hat Z_i\hat Z_j-g\sum_i\hat X_i`, localDensity:T`\hat h_{\mathbf0}=J\sum_{\boldsymbol\delta\in\mathcal D}\hat Z_{\mathbf0}\hat Z_{\boldsymbol\delta}-g\hat X_{\mathbf0}`, definitions:[T`\mathcal D=\{\mathbf e_1,\mathbf e_2,\mathbf e_1-\mathbf e_2\}`,BONDS]},
  '15': {hamiltonian:T`\hat H=J_1\sum_{\langle ij\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j+J_2\sum_{\langle\!\langle ij\rangle\!\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j`, definitions:[SPIN,T`\text{NN: square edges; NNN: both square diagonals; each bond once}`]},
  '16': {hamiltonian:T`\hat H=J\sum_{\langle ij\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j`, definitions:[SPIN,BONDS]},
  '17': {hamiltonian:T`\hat H=J\sum_{\langle ij\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j`, definitions:[SPIN,BONDS]},
  '18': {hamiltonian:T`\hat H=J\sum_{\langle ij\rangle_{\square}}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j+J_d\sum_{\langle ij\rangle_d}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j`, definitions:[SPIN,T`\langle ij\rangle_d:\ (2m,2n)\leftrightarrow(2m+1,2n+1),\quad(2m+2,2n+1)\leftrightarrow(2m+1,2n+2)`,T`(x,y)=(2r_1+b_x,2r_2+b_y),\quad\alpha=b_x+2b_y\quad(b_x,b_y\in\{0,1\})`]},
  '19': {hamiltonian:T`\hat H=-J\sum_{\langle ij\rangle}\hat P_{ij}-Q\sum_{\square=(1234)}\left(\hat P_{12}\hat P_{34}+\hat P_{23}\hat P_{41}\right)`, definitions:[PROJECTOR,SPIN,T`(1,2,3,4)\ \text{are the cyclic vertices of each square}`]},
  '20': {hamiltonian:T`\hat H=-J_x\sum_{\mathbf r}\hat X_{\mathbf r}\hat X_{\mathbf r+\mathbf e_1}-J_z\sum_{\mathbf r}\hat Z_{\mathbf r}\hat Z_{\mathbf r+\mathbf e_2}`},
  '21': {hamiltonian:T`\hat H=-K\sum_{\square}\prod_{i\in\square}\hat Z_i-h\sum_i\hat X_i`, definitions:[T`\square_{\mathbf r}=\{\mathbf r,\mathbf r+\mathbf e_1,\mathbf r+\mathbf e_2,\mathbf r+\mathbf e_1+\mathbf e_2\}`]},
  '22': {hamiltonian:T`\hat H=-\sum_{\gamma=x,y,z}K_\gamma\sum_{(i,j)\in E_\gamma}\hat\sigma_i^\gamma\hat\sigma_j^\gamma`, definitions:[PAULI]},
  '23': {hamiltonian:T`\hat H=\sum_{\gamma=x,y,z}\sum_{(i,j)\in E_\gamma}\left[J\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j+K\hat S_i^\gamma\hat S_j^\gamma+\Gamma\left(\hat S_i^\alpha\hat S_j^\beta+\hat S_i^\beta\hat S_j^\alpha\right)\right]`, definitions:[SPIN,T`\{\alpha,\beta,\gamma\}=\{x,y,z\}`]},
  '24': {hamiltonian:T`\hat H=-\sum_{\gamma=x,y,z}\left[J_\gamma\sum_{(i,j)\in E_\gamma^{\rm in}}\hat\sigma_i^\gamma\hat\sigma_j^\gamma+J'\sum_{(i,j)\in E_\gamma^{\rm out}}\hat\sigma_i^\gamma\hat\sigma_j^\gamma\right]`, definitions:[PAULI,T`E_\gamma^{\rm in}:\ \text{bonds inside the A/B triangles},\quad E_\gamma^{\rm out}:\ \text{bonds between triangles}`]},
  '25': {hamiltonian:T`\hat H=-J_e\sum_v\hat A_v-J_m\sum_p\hat B_p`, localDensity:T`\hat h_{\mathbf0}=-J_e\hat A_{\mathbf0}-J_m\hat B_{\mathbf0}`, definitions:[T`\hat A_v=\prod_{e\ni v}\hat X_e,\qquad \hat B_p=\prod_{e\in\partial p}\hat Z_e`,T`\text{Qubits lie on square edges; }|\operatorname{supp}A_v|=|\operatorname{supp}B_p|=4`]},
  '26': {hamiltonian:T`\hat H=-J\sum_{\mathbf r}\hat X_{\mathbf r}\hat Y_{\mathbf r+\mathbf e_1}\hat X_{\mathbf r+\mathbf e_1+\mathbf e_2}\hat Y_{\mathbf r+\mathbf e_2}`},
  '27': {hamiltonian:T`\hat H=-J_X\sum_p\prod_{i\in\partial p}\hat X_i-J_Z\sum_p\prod_{i\in\partial p}\hat Z_i`, definitions:[T`p:\ \text{honeycomb hexagons; qubits lie on vertices}`]},
  '28': {hamiltonian:T`\hat H=-J\sum_{\mathbf r}\hat X_{\mathbf r}\prod_{\mu=1}^{2}\hat Z_{\mathbf r-\mathbf e_\mu}\hat Z_{\mathbf r+\mathbf e_\mu}`, localDensity:T`\hat h_{\mathbf0}=-J\hat X_{\mathbf0}\prod_{\mu=1}^{2}\hat Z_{-\mathbf e_\mu}\hat Z_{\mathbf e_\mu}`},
  '29': {hamiltonian:T`\hat H=-J\sum_p\hat B_p`, localDensity:T`\hat h_{\mathbf0}=-J\hat B_{\mathbf0}`, definitions:[T`\hat B_p=-\hat X_p\prod_{k=1}^{6} i^{(\hat I-\hat Z_{p+\boldsymbol\delta_k}\hat Z_{p+\boldsymbol\delta_{k+1}})/2}`,T`(\boldsymbol\delta_1,\ldots,\boldsymbol\delta_6)=(\mathbf e_1,\mathbf e_2,\mathbf e_2-\mathbf e_1,-\mathbf e_1,-\mathbf e_2,\mathbf e_1-\mathbf e_2),\qquad\boldsymbol\delta_7=\boldsymbol\delta_1`]},
  '30': {hamiltonian:T`\hat H=-J\sum_i\hat K_i`, localDensity:T`\hat h_{\mathbf0}=-J(\hat K_{\mathbf0,0}+\hat K_{\mathbf0,1})`, definitions:[T`\hat K_i=\hat X_i\prod_{\triangle=(ijk)\ni i}\widehat{\rm CZ}_{jk}`,T`\widehat{\rm CZ}_{jk}=\frac12(\hat I+\hat Z_j+\hat Z_k-\hat Z_j\hat Z_k)`,T`\triangle:\ \text{each square is divided into four triangles by its face-center qubit}`]},
  '31': {hamiltonian:T`\hat H=-J\sum_{\triangle=(ijk)}\hat Z_i\hat Z_j\hat Z_k-h\sum_i\hat X_i`, definitions:[T`\triangle:\ \text{both upward and downward elementary triangles}`]},
  '32': {hamiltonian:T`\hat H=\sum_{p\in\mathcal H_6}\left\{J_z(\hat S^z_p)^2+J_\perp\left[(\hat S^x_p)^2+(\hat S^y_p)^2-3\hat I\right]\right\}`, definitions:[T`\hat S^\alpha_p=\sum_{i\in p}\hat S_i^\alpha,\qquad\mathcal H_6=\{\text{kagome hexagons}\}`,SPIN,T`\text{Each kagome hexagon has six vertices; the additive constant is retained}`]},
  '33': {hamiltonian:T`\hat H=J\sum_{\langle ij\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j+J_\chi\sum_{\triangle=(ijk)}\hat{\boldsymbol S}_i\!\cdot\!\left(\hat{\boldsymbol S}_j\times\hat{\boldsymbol S}_k\right)`, definitions:[SPIN,T`(i,j,k):\ \text{counterclockwise on every elementary triangle}`]},
  '34': {hamiltonian:T`\hat H=-J\sum_{\mathbf r}\sum_{\mu=1}^{3}\hat Z_{\mathbf r}\hat Z_{\mathbf r+\mathbf e_\mu}-g\sum_{\mathbf r}\hat X_{\mathbf r}`, localDensity:T`\hat h_{\mathbf0}=-J\sum_{\mu=1}^{3}\hat Z_{\mathbf0}\hat Z_{\mathbf e_\mu}-g\hat X_{\mathbf0}`},
  '35': {hamiltonian:T`\hat H=J_1\sum_{\langle ij\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j+J_2\sum_{\langle\!\langle ij\rangle\!\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j`, definitions:[SPIN,T`\text{NN: cubic edges; NNN: all face diagonals; each undirected bond once}`]},
  '36': {hamiltonian:T`\hat H=J_1\sum_{\langle ij\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j+J_2\sum_{\langle\!\langle ij\rangle\!\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j`, definitions:[SPIN,T`\text{BCC NN: eight body-diagonal half-steps; NNN: six cubic-axis steps}`]},
  '37': {hamiltonian:T`\hat H=\sum_{\mathbf r}\left(J_x\hat X_{\mathbf r}\hat X_{\mathbf r+\mathbf e_1}+J_y\hat Y_{\mathbf r}\hat Y_{\mathbf r+\mathbf e_2}+J_z\hat Z_{\mathbf r}\hat Z_{\mathbf r+\mathbf e_3}\right)`},
  '38': {hamiltonian:T`\hat H=-K\sum_{\square}\prod_{i\in\square}\hat Z_i-g\sum_i\hat X_i`, definitions:[T`\square_{\mathbf r,\mu\nu}=\{\mathbf r,\mathbf r+\mathbf e_\mu,\mathbf r+\mathbf e_\nu,\mathbf r+\mathbf e_\mu+\mathbf e_\nu\},\quad1\leq\mu<\nu\leq3`]},
  '39': {hamiltonian:T`\hat H=\sum_{\langle ij\rangle}\left[J_z\hat S_i^z\hat S_j^z+J_\perp\left(\hat S_i^x\hat S_j^x+\hat S_i^y\hat S_j^y\right)\right]`, definitions:[SPIN,T`\text{Nearest neighbors on pyrochlore; spin components use the specified abstract local qubit axes}`]},
  '40': {hamiltonian:T`\hat H=J_D\sum_{\mathbf r}\hat{\boldsymbol S}_{\mathbf r,A}\!\cdot\!\hat{\boldsymbol S}_{\mathbf r,B}+J\sum_{\mathbf r,\mu=1}^{3}\hat{\boldsymbol S}_{\mathbf r,A}\!\cdot\!\hat{\boldsymbol S}_{\mathbf r-\mathbf e_\mu,B}`, definitions:[SPIN,T`A=0,\quad B=1;\qquad\mathbf e_\mu\ \text{labels FCC primitive translations}`]},
  '41': {hamiltonian:T`\hat H=-\sum_{\gamma=x,y,z}J_\gamma\sum_{(i,j)\in E_\gamma}\hat\sigma_i^\gamma\hat\sigma_j^\gamma`, definitions:[PAULI]},
  '42': {hamiltonian:T`\hat H=-\sum_{\gamma=x,y,z}J_\gamma\sum_{(i,j)\in E_\gamma}\hat\sigma_i^\gamma\hat\sigma_j^\gamma`, definitions:[PAULI]},
  '43': {hamiltonian:T`\hat H=J\sum_{\langle ij\rangle}\hat{\boldsymbol S}_i\!\cdot\!\hat{\boldsymbol S}_j`, definitions:[SPIN,T`\text{Hyperkagome: twelve sites and twenty-four undirected nearest-neighbor bonds per cell}`]},
  '44': {hamiltonian:T`\hat H=-J\sum_{\mathbf r}\hat X_{\mathbf r}\prod_{\mu=1}^{3}\hat Z_{\mathbf r-\mathbf e_\mu}\hat Z_{\mathbf r+\mathbf e_\mu}`, localDensity:T`\hat h_{\mathbf0}=-J\hat X_{\mathbf0}\prod_{\mu=1}^{3}\hat Z_{-\mathbf e_\mu}\hat Z_{\mathbf e_\mu}`},
  '45': {hamiltonian:T`\hat H=-J_e\sum_v\hat A_v-J_m\sum_p\hat B_p`, localDensity:T`\hat h_{\mathbf0}=-J_e\hat A_{\mathbf0}-J_m\sum_{1\leq\mu<\nu\leq3}\hat B_{\mathbf0,\mu\nu}`, definitions:[T`\hat A_v=\prod_{e\ni v}\hat X_e,\qquad\hat B_p=\prod_{e\in\partial p}\hat Z_e`,T`\text{Qubits lie on cubic edges; }|\operatorname{supp}A_v|=6,\quad|\operatorname{supp}B_p|=4`]},
  '46': {hamiltonian:T`\hat H=-J_c\sum_c\hat A_c-J_v\sum_{v,\mu=1}^{3}\hat B_v^\mu`, localDensity:T`\hat h_{\mathbf0}=-J_c\hat A_{\mathbf0}-J_v\sum_{\mu=1}^{3}\hat B_{\mathbf0}^\mu`, definitions:[T`\hat A_c=\prod_{e\in\operatorname{edges}(c)}\hat X_e,\qquad\hat B_v^\mu=\prod_{\substack{e\ni v\\e\perp\mathbf e_\mu}}\hat Z_e`,T`|\operatorname{supp}A_c|=12,\qquad|\operatorname{supp}B_v^\mu|=4`]},
  '47': {hamiltonian:T`\hat H=-J_X\sum_{c\in\mathcal C_A}\prod_{v\in c}\hat X_v-J_Z\sum_{c\in\mathcal C_A}\prod_{v\in c}\hat Z_v`, definitions:[T`\mathcal C_A=\{\text{unit cubes with lower corner }\mathbf n\in\mathbb Z^3:\ n_1+n_2+n_3\equiv0\!\pmod2\}`,T`\mathbf x=2\mathbf r+(b_x,b_y,b_z),\quad\alpha=b_x+2b_y+4b_z,\qquad b_x,b_y,b_z\in\{0,1\}`]},
  '48': {hamiltonian:T`\hat H=-J_X\sum_{\mathbf r}\hat A_{\mathbf r}-J_Z\sum_{\mathbf r}\hat B_{\mathbf r}`, localDensity:T`\hat h_{\mathbf0}=-J_X\hat A_{\mathbf0}-J_Z\hat B_{\mathbf0}`, definitions:[T`F=\{\mathbf0,\mathbf e_1,\mathbf e_2,\mathbf e_3\},\qquad G=\{\mathbf0,\mathbf e_1+\mathbf e_2,\mathbf e_2+\mathbf e_3,\mathbf e_3+\mathbf e_1\}`,T`\hat A_{\mathbf r}=\prod_{\mathbf u\in F}\hat X_{\mathbf r+\mathbf u,0}\prod_{\mathbf u\in G}\hat X_{\mathbf r+\mathbf u,1}`,T`\hat B_{\mathbf r}=\prod_{\mathbf u\in-G}\hat Z_{\mathbf r+\mathbf u,0}\prod_{\mathbf u\in-F}\hat Z_{\mathbf r+\mathbf u,1}`]},
  '49': {hamiltonian:T`\hat H=-J\sum_{\mathbf u\in\Lambda_{\rm odd}}\hat X_{\mathbf u-\mathbf a_x}\hat X_{\mathbf u+\mathbf a_x}\hat Y_{\mathbf u-\mathbf a_y}\hat Y_{\mathbf u+\mathbf a_y}\hat Z_{\mathbf u-\mathbf a_z}\hat Z_{\mathbf u+\mathbf a_z}`, definitions:[T`\Lambda_{\rm even}=\{\mathbf x\in\mathbb Z^3:x_1+x_2+x_3\equiv0\!\pmod2\}`,T`\Lambda_{\rm odd}=\{\mathbf x\in\mathbb Z^3:x_1+x_2+x_3\equiv1\!\pmod2\}`,T`\text{Qubits lie on }\Lambda_{\rm even};\quad\mathbf a_x,\mathbf a_y,\mathbf a_z\ \text{are Cartesian unit vectors}`,T`\text{FCC translations: }\mathbf e_1=\mathbf a_x+\mathbf a_y,\quad\mathbf e_2=\mathbf a_y+\mathbf a_z,\quad\mathbf e_3=\mathbf a_z+\mathbf a_x`]},
  '50': {hamiltonian:T`\hat H=-J_X\sum_{\text{3-cells }c}\prod_{v\in c}\hat X_v-J_Z\sum_{\text{faces }p}\prod_{v\in p}\hat Z_v`, definitions:[T`\text{Cellulation: Voronoi cells of }\mathbb Z^3\cup\left(\mathbb Z^3+\left(\frac12,\frac12,\frac12\right)\right)`,T`\text{Qubits lie at Voronoi vertices; cell X operators have weight }24,\ \text{face Z operators weight }4\ \text{or }6`]},
};

function coloredBonds(task) {
  const result = [];
  const indices = {X:'x',Y:'y',Z:'z'};
  for (const pauli of ['X','Y','Z']) {
    const entries = task.terms.filter(term => term.word.length === 2 && term.word.every(f => f.pauli === pauli));
    if (!entries.length) continue;
    const sets = String(task.id).padStart(2,'0') === '24' ? [
      ['in', entries.filter(term => (term.word[0].qubit < 3) === (term.word[1].qubit < 3))],
      ['out', entries.filter(term => (term.word[0].qubit < 3) !== (term.word[1].qubit < 3))],
    ] : [['',entries]];
    for (const [kind, terms] of sets) {
      const bonds = terms.map(term => T`\bigl((${siteLatex(term.word[0].cell,term.word[0].qubit,task.qubits_per_cell,true)}),(${siteLatex(term.word[1].cell,term.word[1].qubit,task.qubits_per_cell,true)} )\bigr)`).join(T`,\ `);
      result.push(T`E_{${indices[pauli]}}${kind ? T`^{\rm ${kind}}` : ''}=\bigcup_{\mathbf r\in\mathbb Z^{${task.dimension}}}\left\{${bonds}\right\}`);
    }
  }
  return result;
}

// The honeycomb Gamma model shares the same three bond colors as task 22.
function honeycombGammaBonds(task) {
  const q = task.qubits_per_cell;
  const origin = [0,0];
  const endpoint = {x:[-1,0],y:[0,-1],z:origin};
  return Object.entries(endpoint).map(([axis,cell]) => T`E_${axis}=\left\{\bigl((${siteLatex(origin,0,q,true)}),(${siteLatex(cell,1,q,true)} )\bigr):\mathbf r\in\mathbb Z^2\right\}`);
}

const CHINESE_MATH_TEXT = {
  'Physical site ':'物理站点 ',
  'counts each undirected nearest-neighbor bond once':'每条无向最近邻键只计一次',
  'NN: square edges; NNN: both square diagonals; each bond once':'最近邻为方格边, 次近邻包括两种方格对角线; 每条键只计一次',
  'are the cyclic vertices of each square':'为每个方格的循环顶点编号',
  'bonds inside the A/B triangles':'A/B三角形内部的键',
  'bonds between triangles':'三角形之间的键',
  'Qubits lie on square edges; ':'qubit位于方格边; ',
  'honeycomb hexagons; qubits lie on vertices':'蜂窝六边形; qubit位于顶点',
  'each square is divided into four triangles by its face-center qubit':'每个方格由面心qubit分为四个三角形',
  'both upward and downward elementary triangles':'向上与向下的基本三角形均计入',
  'kagome hexagons':'kagome六边形',
  'Each kagome hexagon has six vertices; the additive constant is retained':'每个kagome六边形有六个顶点; 保留常数项',
  'counterclockwise on every elementary triangle':'每个基本三角形均按逆时针取向',
  'NN: cubic edges; NNN: all face diagonals; each undirected bond once':'最近邻为立方边, 次近邻为全部面对角线; 每条无向键只计一次',
  'BCC NN: eight body-diagonal half-steps; NNN: six cubic-axis steps':'BCC最近邻为八个体对角半格方向, 次近邻为六个立方轴方向',
  'Nearest neighbors on pyrochlore; spin components use the specified abstract local qubit axes':'焦绿石最近邻; 自旋分量使用题目指定的抽象局域qubit轴',
  'labels FCC primitive translations':'表示FCC原始平移',
  'Hyperkagome: twelve sites and twenty-four undirected nearest-neighbor bonds per cell':'Hyperkagome每晶胞有十二个站点及二十四条无向最近邻键',
  'Qubits lie on cubic edges; ':'qubit位于立方边; ',
  'unit cubes with lower corner ':'单位立方体, 其最低角为 ',
  'Qubits lie on ':'qubit位于 ',
  'are Cartesian unit vectors':'为笛卡尔单位矢量',
  'FCC translations: ':'FCC平移: ',
  '3-cells ':'三维胞体 ',
  'faces ':'面 ',
  'Cellulation: Voronoi cells of ':'密铺采用以下点集的Voronoi胞: ',
  'Qubits lie at Voronoi vertices; cell X operators have weight ':'qubit位于Voronoi顶点; 胞体X算符的权重为 ',
  'face Z operators weight ':'面Z算符的权重为 ',
  'or ':'或 ',
};

function localizeMath(text, language) {
  if (!String(language).toLowerCase().startsWith('zh')) return text;
  return text.replace(/\\text\{([^{}]*)\}/g,
    (whole, words) => T`\text{${CHINESE_MATH_TEXT[words] || words}}`);
}

/**
 * Return KaTeX-ready equations for a frozen task, without invoking a renderer.
 * The standard H has the original symbolic parameters; parameterLatex pins the
 * actual benchmark point. expandedLocalDensity is generated from original terms.
 * The latter remains authoritative if adapting this helper to a modified task.
 */
export function modelHamiltonian(task, language = 'en') {
  if (!task || !Array.isArray(task.terms) || ![1,2,3].includes(task.dimension)) {
    throw new TypeError('A finite frozen lattice task is required');
  }
  const id = String(task.id).padStart(2,'0');
  const q = task.qubits_per_cell;
  const dimensions = task.dimension;
  const entry = FORMULAS[id];
  const expanded = T`\hat h_{\mathbf0}=${exactDensity(task.terms,q)}`;
  const definitions = [...(entry?.definitions || [])];
  if (['22','24','41','42'].includes(id)) definitions.push(...coloredBonds(task));
  if (id === '23') definitions.push(...honeycombGammaBonds(task));
  return {
    hamiltonian: localizeMath(entry?.hamiltonian || T`\hat H=\sum_{\mathbf r\in\mathbb Z^{${dimensions}}}\left[${exactDensity(task.terms,q,true)}\right]`,language),
    localDensity: localizeMath(entry?.localDensity || expanded,language),
    expandedLocalDensity: expanded,
    definitions:definitions.map(equation=>localizeMath(equation,language)),
    parameterLatex: parametersLatex(task.parameters),
    siteLatex: q===1 ? T`\Gamma=\mathbb Z^{${dimensions}},\qquad q=1` : T`\Gamma=\mathbb Z^{${dimensions}}\times\{0,\ldots,${q-1}\},\qquad q=${q}`,
    energyLatex:q===1 ? T`e(\omega)=\omega(\hat h_{\mathbf0})` : T`e(\omega)=\frac1{${q}}\,\omega(\hat h_{\mathbf0})`,
    translationLatex:T`\hat H=\sum_{\mathbf r\in\mathbb Z^{${dimensions}}}\tau_{\mathbf r}(\hat h_{\mathbf0})`,
    kind: entry ? 'conventional' : 'exact-pauli-interaction',
    notation: {
      en:'H denotes the infinite local interaction family, not a bounded total operator. X, Y, Z are Pauli matrices. The displayed parameters select the benchmark task; the finite local density retains every constant. Cell coordinates use the stated primitive basis, with zero-based intracell indices.',
      zh:'H表示无限系统的局域相互作用族, 不声称无穷和是有界总算符. X, Y, Z为Pauli矩阵. 所列参数固定本题, 有限局域能量密度保留全部常数. 晶胞坐标使用所述原始基矢, 胞内编号从0开始.',
    },
  };
}
