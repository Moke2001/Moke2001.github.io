'use strict';

// Edit this file to maintain the studio's public content.
// A localized text value uses { zh: '中文', en: 'English' }.
window.STUDIO_CONTENT = {
  person: {
    name: { zh: '墨克', en: 'Mooke' },
    birth: '2001.12',
    email: 'moke_whu@qq.com',
    qq: '739794637',
    wechat: 'mokeishandsome',
    address: {
      zh: '北京市海淀区清华大学MMW-S219',
      en: 'MMW-S219, Tsinghua University, Haidian District, Beijing'
    },
    education: [
      {
        period: '2017.09 - 2020.07',
        institution: { zh: '固始县高级中学', en: 'Gushi Senior High School' }
      },
      {
        period: '2020.09 - 2024.06',
        institution: {
          zh: '武汉大学物理学院',
          en: 'School of Physics, Wuhan University'
        }
      },
      {
        period: '2024.09 - 至今',
        institution: {
          zh: '清华大学交叉信息研究院',
          en: 'Institute for Interdisciplinary Information Sciences, Tsinghua University'
        }
      }
    ]
  },

  researchContext: {
    zh: 'Eureka面向今天这个AI工具日渐成为基础设施的时代, 旨在建立一套全新的顺应潮流的高效的学术范式.',
    en: 'In an era when AI tools are increasingly becoming infrastructure, Eureka aims to establish an entirely new, efficient academic paradigm that keeps pace with this shift.'
  },

  principles: [
    {
      index: '01',
      title: { zh: '充分发挥LLM的潜力', en: 'Realize the Full Potential of LLMs' },
      description: {
        zh: '充分挖掘大型语言模型(LLM)的能力, 让它在科研中发挥作用.',
        en: 'Explore the capabilities of large language models (LLMs) and enable them to contribute fully to research.'
      }
    },
    {
      index: '02',
      title: { zh: '充分采纳人类的直觉和灵感', en: 'Fully Embrace Human Intuition and Inspiration' },
      description: {
        zh: '将人类的直觉和灵感纳入研究过程, 为问题探索提供方向.',
        en: 'Bring human intuition and inspiration into the research process to help guide exploration.'
      }
    },
    {
      index: '03',
      title: { zh: '充分尊重人类的理解和认知', en: 'Fully Respect Human Understanding and Cognition' },
      description: {
        zh: '在科研过程中充分尊重人的理解和认知, 重视人对问题的思考.',
        en: 'Respect human understanding and cognition throughout research, with attention to how people think about problems.'
      }
    },
    {
      index: '04',
      title: { zh: '提高人机协同科研的效率', en: 'Improve the Efficiency of Human-AI Research' },
      description: {
        zh: '改进人与人工智能协同科研的工作方式, 让合作过程更加高效.',
        en: 'Improve how humans and AI conduct research together so their collaboration becomes more efficient.'
      }
    },
    {
      index: '05',
      title: { zh: '促进人机协同进化', en: 'Promote Human-AI Coevolution' },
      description: {
        zh: '让人类与人工智能在持续协作中相互促进, 共同改进科研能力.',
        en: 'Encourage humans and AI to support one another through continued collaboration and develop their research capabilities together.'
      }
    }
  ],

  // Add a publication only when its real details and links are available.
  // Publication schema:
  // {
  //   id: 'unique-slug',
  //   title: 'Original English title',
  //   authors: 'Author One, Author Two',
  //   abstract: 'English abstract or explicitly labeled abstract summary',
  //   abstractKind: 'original', // 'original' or a faithful 'summary'.
  //   field: { zh: '研究领域', en: 'Research field' },
  //   date: '2026.11',
  //   status: { zh: '预印本', en: 'Preprint' }, // Optional.
  //   pdf: 'assets/publications/paper.pdf', // Relative path or HTTPS URL.
  //   latex: 'assets/publications/source.zip', // Relative path or HTTPS URL.
  //   scirate: 'https://scirate.com/arxiv/...',
  //   arxiv: 'https://arxiv.org/abs/...',
  //   motivation: { zh: '研究动机', en: 'Research motivation' },
  //   value: { zh: '研究价值', en: 'Research value' },
  //   innovation: { zh: '创新之处', en: 'Innovation' }
  // }
  // Use an empty string for an unavailable optional link or description.
  publications: [
    {
      id: 'partial-self-correction',
      title: 'Universally Certifying Partially Self-Correcting Quantum Memories in 3D Translation-Invariant Stabilizer Codes',
      authors: 'Chong-Yuan Xu, Yong Xu',
      abstract: "Achieving passive protection of quantum information at finite temperature is a central problem at the intersection of quantum information and quantum many-body physics. Yet a general, computable criterion for determining self-correcting behavior directly from the form of local interactions remains elusive. Here we develop a unified algebraic-geometric framework for certifying partial self-correction in three-dimensional translation-invariant local stabilizer codes, encompassing the cubic code as a special case. From the algebraic curves defined by the codes' defining polynomials, we construct valuation matrices on the boundaries of their normalized projective closures and derive a computable rank criterion. Together with a polynomial-time decoder, this criterion guarantees super-Arrhenius memory lifetimes for code families satisfying it under the specified local Davies dynamics. We apply the framework to certify several classes of partially self-correcting quantum memories, including nearest-neighbor models with stabilizer weight as low as six and long memory lifetimes at modest system sizes. These results establish an algebraic-geometric connection between local stabilizer structure and the recoverability of quantum information at finite temperature, providing a systematic approach to certifying and designing passive quantum memories.",
      abstractKind: 'original',
      field: { zh: '量子纠错', en: 'Quantum error correction' },
      date: '2026.11',
      status: { zh: '预印本', en: 'Preprint' },
      pdf: 'https://arxiv.org/pdf/2611.06469v1',
      latex: 'https://arxiv.org/src/2611.06469v1',
      scirate: 'https://scirate.com/arxiv/2611.06469',
      arxiv: 'https://arxiv.org/abs/2611.06469v1',
      motivation: {
        zh: '有限温度下的被动量子保护需要可检验的判据, 研究尝试从三维平移不变稳定子码的局域相互作用出发作出认证.',
        en: 'The need for testable criteria for passive quantum protection at finite temperature motivates certification from local interactions in three-dimensional translation-invariant stabilizer codes.'
      },
      value: {
        zh: '对满足判据的码族, 结果在指定局域Davies动力学下保证超阿伦尼乌斯记忆寿命, 为部分自纠错提供条件明确的认证.',
        en: 'For code families satisfying the criterion, the result guarantees super-Arrhenius memory lifetimes under the specified local Davies dynamics, providing a conditional certification of partial self-correction.'
      },
      innovation: {
        zh: '从定义多项式关联的代数曲线构造边界赋值矩阵, 并将可计算秩判据与多项式时间解码器相结合.',
        en: 'The framework uses boundary valuation matrices of algebraic curves to derive a computable rank criterion, combined with a polynomial-time decoder.'
      }
    },
    {
      id: 'space-group-codes',
      title: 'Topological Codes from Space Groups: A Route beyond Translation Invariance',
      authors: 'Chong-Yuan Xu, Ze-Chuan Liu, Yong Xu',
      abstract: 'This work introduces space-group quantum codes whose stabilizer algebra incorporates crystallographic point-group operations, extending beyond translation-generated constructions. Point-group orbits support an algebraic test for topological order and a folded geometry that makes spatial operations local. Selected examples improve upon reported bivariate bicycle benchmarks at matching block length and check weight. In five matched neutral-atom comparisons, reflection codes reduce optimized atom-movement costs by up to 60 percent. Folded placements also support lower-overhead superconducting layouts, linking code performance with hardware geometry.',
      abstractKind: 'summary',
      field: { zh: '量子纠错', en: 'Quantum error correction' },
      date: '2026.06',
      pdf: 'https://arxiv.org/pdf/2606.20548',
      latex: 'https://arxiv.org/src/2606.20548',
      scirate: 'https://scirate.com/arxiv/2606.20548',
      arxiv: 'https://arxiv.org/abs/2606.20548',
      motivation: {
        zh: '将平移对称之外的空间操作纳入量子码构造, 有助于探索与实际器件几何相适应的拓扑码结构.',
        en: 'Including spatial operations beyond translations motivates the exploration of topological code structures suited to physical hardware geometry.'
      },
      value: {
        zh: '研究将拓扑序的代数判据与折叠几何布局相联系, 为同时考察纠错性能与硬件空间开销提供具体构造.',
        en: 'The work connects an algebraic test for topological order with folded layouts, providing constructions for examining error correction alongside hardware geometry.'
      },
      innovation: {
        zh: '利用空间群中的点群轨道构建稳定子代数与折叠布局, 使相关空间操作在对应几何中具有局域实现.',
        en: 'Point-group orbits enter the stabilizer algebra and folded layouts, enabling local realizations of the associated spatial operations in the resulting geometry.'
      }
    },
    {
      id: 'self-dual-stacked',
      title: 'Self-dual Stacked Quantum Low-Density Parity-Check Codes',
      authors: 'Ze-Chuan Liu, Chong-Yuan Xu, Yong Xu',
      abstract: 'This work constructs self-dual quantum LDPC codes by stacking codes that are not themselves self-dual, supporting efficient transversal Clifford operations. The construction yields double-chain bicycle, double-layer bivariate bicycle, twisted bivariate bicycle, and reflection code families. The authors examine their encoding parameters and structural properties, and evaluate selected examples as quantum memories through circuit-level simulations. They report logical-error suppression and high pseudo-thresholds, providing a systematic construction of self-dual code families for fault-tolerant quantum computing.',
      abstractKind: 'summary',
      field: { zh: '量子纠错', en: 'Quantum error correction' },
      date: '2026.02',
      pdf: 'https://arxiv.org/pdf/2602.15372',
      latex: 'https://arxiv.org/src/2602.15372',
      scirate: 'https://scirate.com/arxiv/2602.15372',
      arxiv: 'https://arxiv.org/abs/2602.15372',
      motivation: {
        zh: '量子容错计算需要兼顾存储效率与逻辑操作能力, 自对偶结构为实现横向克利福德操作提供了一条构造思路.',
        en: 'Fault-tolerant quantum computing calls for efficient storage and logical operations, motivating self-dual codes that support transversal Clifford operations.'
      },
      value: {
        zh: '研究将自对偶码的代数结构与电路级量子存储模拟相联系, 为评估编码参数与逻辑错误抑制提供实例.',
        en: 'The work connects self-dual code structure with circuit-level memory simulations, providing examples for evaluating encoding parameters and logical-error suppression.'
      },
      innovation: {
        zh: '通过堆叠本身未必自对偶的码构造自对偶码族, 并得到多种自行车码与反射码结构.',
        en: 'The construction stacks codes that need not be self-dual to obtain self-dual families, including several bicycle and reflection code structures.'
      }
    },
    {
      id: 'fermion-to-fermion',
      title: 'Fermion-to-Fermion Low-Density Parity-Check Codes',
      authors: 'Chong-Yuan Xu, Ze-Chuan Liu, Yong Xu',
      abstract: 'This study develops an architecture for fault-tolerant computation directly with fermions. Fermionic LDPC codes store quantum information, while fermionic color-code processors perform logical operations after state transfer. The construction uses odd-weight logical Majorana operators and includes an algorithm for finding them. Example codes achieve encoding rates comparable to corresponding qubit codes and suppress logical failures below physical error rates. Two fermionic lattice-surgery methods connect memory and processors. Simulations of fermionic dynamics illustrate the error-suppression capabilities of the proposed protocol.',
      abstractKind: 'summary',
      field: { zh: '量子纠错', en: 'Quantum error correction' },
      date: '2025.08',
      pdf: 'https://arxiv.org/pdf/2508.15323',
      latex: 'https://arxiv.org/src/2508.15323',
      scirate: 'https://scirate.com/arxiv/2508.15323',
      arxiv: 'https://arxiv.org/abs/2508.15323',
      motivation: {
        zh: '直接处理费米量子信息需要相应的容错存储与逻辑操作, 因而需要将量子存储器和处理器连接起来的架构.',
        en: 'Computing directly with fermionic quantum information motivates an architecture that connects fault-tolerant memory with logical processing.'
      },
      value: {
        zh: '研究为费米量子信息给出从存储到处理的联合方案, 并通过码参数分析与费米动力学模拟考察其纠错能力.',
        en: 'The work provides a combined storage-and-processing scheme for fermionic quantum information and examines its error-correction capabilities through code analysis and dynamics simulations.'
      },
      innovation: {
        zh: '利用奇权逻辑马约拉纳算符构造费米码, 结合算符搜索算法及两种费米晶格手术来连接存储器和处理器.',
        en: 'The work combines a construction based on odd-weight logical Majorana operators with an operator-search algorithm and two fermionic lattice-surgery methods.'
      }
    },
    {
      id: 'surface-tension',
      title: 'Measurement of surface tension coefficients of liquids based on equal thickness interference',
      authors: 'Ziyi Xu, Chongyuan Xu, Liwen Tong, Keyu Chen, Ziwei Dong',
      abstract: 'This work presents an optical method for measuring liquid surface tension using equal-thickness interference. A mathematical description of the stationary liquid surface connects its shape to the surface tension coefficient, which is extracted from measured interference patterns. The approach aims to reduce uncertainties associated with film-rupture measurements while using simple, inexpensive instrumentation. Experiments report a maximum measurement error below 3.1 percent. The authors also discuss extending the method to liquid-liquid interfaces and measurements of interfacial properties.',
      abstractKind: 'summary',
      field: { zh: '实验物理', en: 'Experimental physics' },
      date: '2025.01',
      pdf: 'https://arxiv.org/pdf/2501.05257',
      latex: 'https://arxiv.org/src/2501.05257',
      scirate: 'https://scirate.com/arxiv/2501.05257',
      arxiv: 'https://arxiv.org/abs/2501.05257',
      motivation: {
        zh: '传统液膜破裂测量中的不确定性促使研究探索另一条光学路径, 以简单仪器提取液体的表面张力系数.',
        en: 'Uncertainties in film-rupture measurements motivate an optical approach that extracts liquid surface tension using simple instrumentation.'
      },
      value: {
        zh: '方法将可观测的干涉条纹与液面形状及表面张力联系起来, 为实验室的液体界面测量提供一种光学方案.',
        en: 'The method relates observable interference patterns to liquid-surface shape and surface tension, providing an optical approach to laboratory interface measurements.'
      },
      innovation: {
        zh: '从静止液面的数学描述出发, 利用等厚干涉图样求取表面张力系数, 并讨论向液液界面测量的扩展.',
        en: 'The method derives surface tension from equal-thickness interference through a mathematical model of the stationary liquid surface and discusses extension to liquid-liquid interfaces.'
      }
    }
  ],

  // Add a project only when its real details and links are available.
  // Project schema:
  // {
  //   id: 'unique-slug',
  //   title: 'Project title',
  //   summary: { zh: '项目简介', en: 'Project summary' },
  //   field: { zh: '项目领域', en: 'Project field' },
  //   date: '2026.11',
  //   github: 'https://github.com/owner/repository',
  //   zip: 'assets/projects/project.zip', // Relative path or HTTPS URL.
  //   motivation: { zh: '项目动机', en: 'Project motivation' },
  //   value: { zh: '项目价值', en: 'Project value' },
  //   innovation: { zh: '创新之处', en: 'Innovation' }
  // }
  // Use an empty string for an unavailable optional link or description.
  projects: [
    {
      id: 'extended-stim',
      title: 'ExtendedStim',
      summary: {
        zh: '面向费米与玻色量子纠错的Python工具, 用于构造和测试量子纠错码与量子电路. 支持计算码参数, 并通过蒙特卡洛模拟估计逻辑错误率.',
        en: 'A Python package for fermionic and bosonic quantum error correction. It provides a workflow for constructing and testing quantum error-correcting codes and circuits, computing code parameters, and estimating logical error rates through Monte Carlo simulations.'
      },
      field: { zh: '量子纠错', en: 'Quantum error correction' },
      date: '',
      github: 'https://github.com/Moke2001/ExtendedStim',
      zip: 'https://github.com/Moke2001/ExtendedStim/archive/refs/heads/master.zip',
      motivation: {
        zh: '构造和测试量子纠错码需要连接码参数计算与电路模拟, 项目因此提供面向费米和玻色量子纠错的共同工作流程.',
        en: 'Constructing and testing quantum error-correcting codes motivates a shared workflow connecting code-parameter computation with circuit simulation for fermionic and bosonic settings.'
      },
      value: {
        zh: '项目把纠错码与量子电路的构造, 码参数计算和逻辑错误率估计放在同一工具中, 便于组织数值探索.',
        en: 'The package brings code and circuit construction, code-parameter computation, and logical-error-rate estimation into one tool for organizing numerical exploration.'
      },
      innovation: {
        zh: '围绕费米与玻色量子纠错组织Python工具, 将纠错码构造及参数计算与基于蒙特卡洛模拟的电路评估衔接起来.',
        en: 'The package organizes fermionic and bosonic quantum error correction around a workflow connecting code construction and parameter computation with Monte Carlo circuit evaluation.'
      }
    }
  ]
};
