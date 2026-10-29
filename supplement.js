/* Corrections and additional, independently selectable practical workflows. */
(() => {
  const tasks = window.MANUAL;
  // Older notes stored a literal backslash-n and escaped shell quotes.
  for (const t of tasks) for (const s of t.steps) for (const c of (s.commands || [])) {
    c.code = c.code.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  const find = id => tasks.find(t => t.id === id);
  const core = find('vasp-core');
  core.steps[2].commands[0] = {purpose:'完整 INCAR：三维半导体晶胞和原子共同优化的示例；保存为 INCAR',code:`SYSTEM = semiconductor bulk relaxation
ENCUT  = 520
EDIFF  = 1E-6
EDIFFG = -0.02
ISMEAR = 0
SIGMA  = 0.05
IBRION = 2
ISIF   = 3
NSW    = 100
LREAL  = Auto
LWAVE  = .FALSE.
LCHARG = .FALSE.`,notes:'SYSTEM：任务名；ENCUT：平面波截断能，单位 eV，520 只是示例，需对赝势和性质做收敛测试；EDIFF：电子能量收敛阈值 eV；EDIFFG：负值表示力阈值 eV/Å；ISMEAR/SIGMA：占据展宽及宽度 eV；IBRION=2：共轭梯度优化；ISIF=3：晶胞形状、体积和离子均可变化；NSW：最大离子步数；LREAL：投影方案；LWAVE/LCHARG：是否保存波函数和电荷。磁性、DFT+U、色散和金属展宽按体系添加。表面体系通常不使用 ISIF=3。'};
  core.steps[4].commands[1] = {purpose:'完整 INCAR：在优化结构上进行静态自洽示例；保存为 INCAR',code:`SYSTEM = semiconductor bulk static SCF
ENCUT  = 520
EDIFF  = 1E-6
ISMEAR = 0
SIGMA  = 0.05
IBRION = -1
NSW    = 0
ISTART = 0
ICHARG = 2
LREAL  = .FALSE.
LWAVE  = .TRUE.
LCHARG = .TRUE.`,notes:'NSW=0 和 IBRION=-1 固定离子；ISTART=0、ICHARG=2 从头初始化；LWAVE 和 LCHARG 写出 WAVECAR 与 CHGCAR。ENCUT=520 eV、ISMEAR=0、SIGMA=0.05 eV 均为示例，需针对体系收敛；继续保持与优化相同的泛函、赝势、磁性和 DFT+U 设置。'};
  core.reference = 'https://vasp.at/wiki/Setting_up_an_electronic_minimization';
  for (const id of ['vasp-band','vasp-dos']) {
    const t = find(id); t.cautions.push('此 ICHARG=11 流程适用于所列常规 DFT，不能用于杂化泛函；d/f 体系应检查 LMAXMIX 和源 SCF 的一致性。');
    t.reference = 'https://vasp.at/wiki/ICHARG';
  }
  for (const id of ['vasp-hse','vasp-hse-properties']) {
    const t = find(id); t.cautions.push('HSE 禁止使用 ICHARG=11 固定电荷。保持常规 k 网格并按版本采用 KPOINTS_OPT 或零权重路径点；杂化泛函依赖轨道而非仅依赖 CHGCAR。');
    t.reference = 'https://vasp.at/wiki/Band-structure_calculation_using_hybrid_functionals';
  }
  const rdf = find('gmx-rdf');
  rdf.steps[1].purpose = '分析 10–20 ns 的平衡生产轨迹，计算参考组与目标组之间的 RDF 与累计配位数。';
  rdf.steps[1].commands[0] = {purpose:'分析 10000–20000 ps（即 10–20 ns），bin 为 0.005 nm，最大半径 1 nm；交互选择参考组和目标组',code:'gmx rdf -f md.xtc -s md.tpr -n index.ndx -b 10000 -e 20000 -o rdf.xvg -cn rdf_cn.xvg -bin 0.005 -rmax 1',notes:'-b/-e 单位为 ps；-bin 和 -rmax 单位为 nm。rdf.xvg 是 g(r)，rdf_cn.xvg 是随半径积分的累计配位数；取第一极小值处的积分值时需检查组定义和归一化。确保轨迹覆盖该时间段并已充分平衡。'};
  rdf.reference='https://manual.gromacs.org/current/onlinehelp/gmx-rdf.html';
  const hb = find('gmx-hbond');
  hb.steps[0].commands[0] = {purpose:'GROMACS 2024 及以后：选择参考组和目标组，输出氢键数及索引',code:'gmx hbond -s md.tpr -f md.xtc -n index.ndx -num hbnum.xvg -o hbond.ndx',notes:'新版本使用 -o 写索引；交互选择的两组须符合程序要求。GROMACS 2023 及以前旧实现使用 -hbn；2024 及以后旧实现可用 gmx hbond-legacy。判据和组选取需在输出中核实。'};
  hb.reference='https://manual.gromacs.org/current/onlinehelp/gmx-hbond.html';
  const initial = find('orca-start');
  initial.steps[0].commands = [{purpose:'完整的水分子 ORCA 输入 water.inp',code:`! B3LYP def2-SVP TightSCF
%pal nprocs 4 end
%maxcore 1500
* xyz 0 1
O  0.0000  0.0000  0.0000
H  0.0000  0.0000  0.9600
H  0.0000  0.9300 -0.2400
*`,notes:'B3LYP 是泛函，def2-SVP 是基组，TightSCF 收紧自洽阈值；nprocs=4 为进程数；maxcore=1500 是每进程内存预算，单位 MB；xyz 0 1 表示总电荷 0、自旋多重度 1；坐标单位 Å。'}];
  initial.steps.splice(1,1);
  initial.reference = 'https://www.faccts.de/docs/orca/6.1/tutorials/prop/single_point.html';
  const ORCA = 'https://www.faccts.de/docs/orca/6.1/manual/';
  const xyz = `* xyz 0 1
O  0.0000  0.0000  0.0000
H  0.0000  0.0000  0.9600
H  0.0000  0.9300 -0.2400
*`;
  const cases = [
    ['orca-sp','单点能','Single-point energy','电子结构','在给定几何上计算电子能。','B3LYP def2-TZVP TightSCF','FINAL SINGLE POINT ENERGY','单点计算不会改变几何；比较能量需使用相同方法、基组、溶剂模型和自旋。', ''],
    ['orca-opt','结构优化','Geometry optimization','结构与反应','寻找局部稳定构型。','B3LYP def2-SVP TightSCF Opt','THE OPTIMIZATION HAS CONVERGED','优化收敛只说明找到驻点；随后进行频率计算判断是否为极小值。',''],
    ['orca-freq','振动频率与热化学','Frequencies and thermochemistry','结构与反应','计算正常振动、零点能和热化学修正。','B3LYP def2-SVP TightSCF Freq','VIBRATIONAL FREQUENCIES','先以同一理论水平优化几何；极小值应无显著虚频。检查低频、温度、压力和标准态。',''],
    ['orca-optfreq','优化后计算频率','Optimization followed by frequencies','结构与反应','在一个作业中先优化再计算振动。','B3LYP def2-SVP TightSCF Opt Freq','VIBRATIONAL FREQUENCIES','检查几何优化、SCF 和频率结果；低频和虚频应检查振动模式。',''],
    ['orca-dispersion','色散修正结构优化','Dispersion-corrected optimization','结构与反应','考虑非共价相互作用后优化分子。','B3LYP D3BJ def2-SVP TightSCF Opt','THE OPTIMIZATION HAS CONVERGED','D3BJ 是示例色散方案；不同泛函与修正的适配性及重复计入应核对。',''],
    ['orca-solvent','隐式水溶剂单点','Implicit-water single point','溶剂效应','在 CPCM 水溶剂模型中计算单点能。','B3LYP def2-TZVP TightSCF CPCM(water)','FINAL SINGLE POINT ENERGY','比较溶剂化能时保持几何、方法和基组一致；溶剂模型不能代替显式氢键。',''],
    ['orca-tddft','TDDFT 激发态与吸收','TDDFT excited states','光谱与电子性质','计算多个垂直激发态并检查跃迁能与振子强度。','B3LYP def2-SVP TightSCF','ABSORPTION SPECTRUM','nroots=10 为示例激发态数；激发态顺序和能量对泛函、基组和溶剂敏感。','%tddft\n  nroots 10\nend\n'],
    ['orca-triplet','开壳层三重态单点','Open-shell triplet single point','电子结构','设置三重态并检查自旋污染。','B3LYP def2-SVP TightSCF','FINAL SINGLE POINT ENERGY','仅当体系电子数和物理态允许三重态时使用；检查 <S**2> 是否接近三重态理想值 2。','TRIPLET'],
    ['orca-hf','Hartree–Fock 单点','Hartree–Fock single point','电子结构','计算 HF 参考能量。','HF def2-SVP TightSCF','FINAL SINGLE POINT ENERGY','HF 不含动态电子相关；不要直接将其视为与相关方法等价的结果。',''],
    ['orca-mp2','MP2 单点能','MP2 single-point energy','电子结构','在给定结构上计算 MP2 相关能。','MP2 def2-TZVP TightSCF','FINAL SINGLE POINT ENERGY','成本较 DFT 高；检查参考态、自旋污染以及基组收敛。',''],
    ['orca-tightopt','高精度结构优化','Tight geometry optimization','结构与反应','用更严格的几何阈值优化结构。','B3LYP def2-SVP TightSCF TightOpt','THE OPTIMIZATION HAS CONVERGED','收紧阈值不会保证找到全局最低构型；比较不同初始构象并计算频率。',''],
    ['orca-numfreq','数值频率','Numerical frequencies','结构与反应','对缺少解析 Hessian 的方法使用数值频率。','B3LYP def2-SVP TightSCF NumFreq','VIBRATIONAL FREQUENCIES','数值频率需多次梯度计算且成本较高；先优化并保证梯度与 SCF 充分收敛。','']
  ];
  for (const [id,title,en,group,goal,keywords,marker,check,block] of cases) {
    const coords = block === 'TRIPLET' ? xyz.replace('xyz 0 1','xyz 0 3') : xyz;
    const extra = block === 'TRIPLET' ? '' : block;
    const input = `! ${keywords}\n%pal nprocs 4 end\n%maxcore 1500\n${extra}${coords}`;
    const t = flow(id,'ORCA',group,'ORCA：'+title,'ORCA: '+en,goal,goal,goal,
      ['ORCA 6.1 安装及与集群匹配的并行环境','待计算的坐标、电荷和自旋；下面以水分子演示'],[
      step('建立完整输入文件','Prepare the complete input','将下面内容保存为 job.inp；替换坐标、电荷、自旋和资源。',[
        {purpose:'ORCA 输入文件 job.inp',code:input,notes:'! 行指定方法、基组和任务；nprocs=4 是进程数；maxcore=1500 MB 是每进程内存预算；xyz 后两数分别为总电荷和自旋多重度，坐标为 Å。示例参数须按目标体系调整。'+(id==='orca-tddft'?' %tddft 的 nroots=10 请求 10 个激发根。':'')}],
        'job.inp。','确认电子数、电荷与自旋匹配；实际体系先检查结构和方法。'),
      step('运行作业并检查输出','Run and inspect output','在作业调度器分配的计算节点运行。',[
        command('执行 ORCA，输出写入 job.out','"$ORCA/orca" job.inp > job.out'),
        command('查找任务结果和正常终止标志',`grep -E '${marker}|ORCA TERMINATED NORMALLY' job.out`)],
        'job.out 和相关结果文件。',check+' 同时确认 SCF 收敛及 ORCA TERMINATED NORMALLY。')],
      ['水分子只用于演示输入结构；计算生产体系前应验证理论方法、基组、资源和收敛。'],'示例流程 / Example workflow');
    t.reference=ORCA; tasks.push(t);
  }
  const gaussianCases = [
    ['gauss-sp','单点能','Single-point energy','电子结构','#p b3lyp/6-31g(d) sp','固定几何计算电子能；比较体系时保持理论水平一致。'],
    ['gauss-opt','结构优化','Geometry optimization','结构与反应','#p b3lyp/6-31g(d) opt','优化得到驻点；应继续计算频率，检查是否为期望的极小值。'],
    ['gauss-freq','频率和热化学','Frequency and thermochemistry','结构与反应','#p b3lyp/6-31g(d) freq','使用同水平优化的几何；检查虚频、低频、温度和标准态。'],
    ['gauss-opt-freq','优化和频率','Optimization and frequency','结构与反应','#p b3lyp/6-31g(d) opt freq','先优化再计算频率；极小值应无显著虚频。'],
    ['gauss-solvent','隐式水溶剂单点','Implicit water single point','溶剂效应','#p b3lyp/6-31g(d) scrf=(smd,solvent=water)','SMD 水模型为示例，溶剂化比较需检查几何、基组和标准态。'],
    ['gauss-td','TDDFT 激发态','TDDFT excited states','光谱与电子性质','#p b3lyp/6-31g(d) td=(nstates=10)','nstates=10 请求十个激发态；核对激发态性质、振子强度及基组敏感性。'],
    ['gauss-mp2','MP2 单点','MP2 single-point energy','电子结构','#p mp2/6-31g(d) sp','检查参考态和基组收敛；MP2 计算开销通常大于常规 DFT。'],
    ['gauss-tight-opt','严格结构优化','Tight geometry optimization','结构与反应','#p b3lyp/6-31g(d) opt=tight','收紧优化阈值并通过频率判断驻点；不能保证全局最低构型。']
  ];
  for (const [id,title,en,group,route,check] of gaussianCases) {
    const input = `%chk=job.chk\n%nprocshared=4\n%mem=4GB\n${route}\n\nWater example\n\n0 1\nO  0.0000  0.0000  0.0000\nH  0.0000  0.0000  0.9600\nH  0.0000  0.9300 -0.2400\n\n`;
    const t = flow(id,'Gaussian',group,'Gaussian：'+title,'Gaussian: '+en,check,check,check,
      ['已授权的 Gaussian 环境','分子坐标、电荷和自旋多重度'],[
      step('准备完整输入','Prepare complete input','保存为 job.gjf；保留标题和坐标段之间的空行。',[
        {purpose:'Gaussian 完整输入文件',code:input,notes:'%chk 是检查点文件；%nprocshared=4 为共享内存进程数；%mem=4GB 为总内存设置；# 行定义方法、基组和任务；0 1 是电荷和多重度；坐标单位 Å。根据分配资源和体系更改示例值。'}],
        'job.gjf。','检查电子数、电荷、多重度、方法和基组。'),
      step('执行并检查结果','Run and check output','在计算节点运行并保留日志和 checkpoint。',[
        command('运行 Gaussian（命令名取决于安装版本）','g16 < job.gjf > job.log'),
        command('检查 SCF 能量和正常终止','grep -E "SCF Done|Normal termination" job.log')],
        'job.log 和 job.chk。',check+' 还需确认 Gaussian 正常终止；MP2 总能量应读取相关方法对应的能量项而非仅 SCF 能量。')],
      ['示例针对 Gaussian 16；计算方法与资源参数需结合体系和版本验证。'],'示例流程 / Example workflow');
    t.reference='https://gaussian.com/g16input/'; tasks.push(t);
  }
  const linux = [
    ['cpu','查看 CPU','Inspect CPU','lscpu','显示型号、物理核、线程和 NUMA 信息；查看 CPU(s)、Core(s) per socket 和 Socket(s)。','分配给作业的 CPU 可能少于节点总数，以调度器分配为准。'],
    ['memory','查看可用内存','Inspect memory','free -h','显示总内存、已用内存和 available；重点查看 available 而非单独的 free。','节点空闲内存不等于当前作业的内存限额。'],
    ['disk','查看文件系统空间','Inspect disk space','df -h .','显示当前目录所在文件系统的容量与剩余空间。','scratch 和 home 可能是不同文件系统；分别在目标路径检查。'],
    ['du','查看目录大小','Measure directory size','du -sh ./calc','统计 calc 目录总大小；-s 汇总，-h 使用可读单位。','符号链接和文件系统配额可能使统计与配额不同。'],
    ['quota','查看个人配额','Inspect storage quota','quota -s','显示支持 quota 系统上的用户磁盘配额与使用量。','集群可能使用其他配额命令；以管理员文档为准。'],
    ['top','查看动态进程','Monitor running processes','top -u "$USER"','查看当前用户进程的 CPU 和内存使用；按 q 退出。','在计算节点查看目标作业；登录节点并不代表计算节点的负载。'],
    ['ps','查看自己的进程','List user processes','ps -u "$USER" -o pid,stat,etime,%cpu,%mem,args','列出进程号、状态、运行时间、CPU、内存和命令。','多节点 MPI 进程需在相应节点查看。'],
    ['gpu','查看 NVIDIA GPU','Inspect NVIDIA GPUs','nvidia-smi','查看显卡、显存占用和关联进程。','集群可能限制可见设备；非 NVIDIA GPU 使用对应工具。'],
    ['modules','查看已加载模块','Inspect loaded modules','module list','查看当前环境加载的编译器、MPI 与软件模块。','modules 是集群环境提供的 shell 功能；容器或普通 Linux 可能没有。'],
    ['which','定位可执行文件','Locate an executable','command -v vasp_std','显示 shell 将调用的 vasp_std 路径。','找不到时检查 module 和 PATH；文件存在不代表当前作业有许可。'],
    ['queue','查看 Slurm 作业','Inspect Slurm jobs','squeue -u "$USER"','列出当前用户排队或运行中的 Slurm 作业及状态。','队列中消失不等于成功，使用 sacct 和应用日志核实。'],
    ['jobdetail','查看 Slurm 作业详情','Inspect Slurm job details','scontrol show job 123456','显示作业 123456 的状态、资源、节点和原因；替换为实际编号。','排队原因和资源分配随作业状态变化。'],
    ['history','查看已结束作业','Inspect completed Slurm jobs','sacct -j 123456 --format=JobID,State,ExitCode,Elapsed,MaxRSS','查询 123456 的状态、退出码、运行时间和峰值内存。','MaxRSS 通常按作业步报告；同时检查应用收敛与输出。'],
    ['cancel','取消 Slurm 作业','Cancel a Slurm job','scancel 123456','取消作业 123456；执行前替换并核对作业编号。','取消会中断计算；先确认 checkpoint 和重启策略。'],
    ['tail','实时查看日志','Follow a log','tail -f slurm-123456.out','持续显示日志新增内容；按 Ctrl+C 停止查看。','替换为实际输出路径；缓冲可能延迟显示。'],
    ['find','查找结果文件','Find result files','find ./calc -type f -name OUTCAR','递归查找 calc 下名为 OUTCAR 的普通文件。','大型目录遍历可能较慢；结果可能来自多个不同计算。'],
    ['grep','搜索输出关键字','Search output text','grep -n "reached required accuracy" OUTCAR','在 OUTCAR 中搜索几何收敛提示并显示行号。','未找到并不能单独诊断原因；检查完整输出和离子步。'],
    ['hash','生成文件校验值','Hash files','sha256sum INCAR POSCAR KPOINTS','为三个输入文件生成 SHA-256 校验值，用于传输前后比对。','校验值相同只能证明文件内容一致，不能证明输入设置正确。'],
    ['rsync','预览目录同步','Preview directory synchronization','rsync -avn ./calc/ user@host:/path/to/calc/','使用 -n 预览待复制文件；-a 保留常见属性，-v 显示文件。','替换地址和目录；确认清单后去掉 -n 才会复制。'],
    ['archive','检查归档内容','Inspect archive contents','tar -tzf results.tar.gz','列出 gzip 压缩归档中的文件，确认预期结果存在。','列目录不等于完整恢复测试；重要备份还需在独立位置解压核验。']
  ];
  for (const [id,title,en,code,meaning,check] of linux) {
    const t=flow('linux-'+id,'Linux','常用命令',title,en,meaning,meaning,meaning,
      ['Linux shell；集群专用命令需要相应调度器或模块环境'],[
        step('执行命令','Run the command',meaning,[command(meaning,code)],'命令输出或作业操作结果。',check)
      ],['命令中的示例路径、账号和作业编号要替换为实际值。'],'单项功能 / Command');
    tasks.push(t);
  }
  const gromacs = [
    ['check','检查轨迹时间和帧数','Check trajectory','gmx check -f md.xtc','检查 md.xtc 的帧、时间范围与时间间隔。','将输出与预期模拟时长及轨迹写出频率核对；不能单靠此命令确认模拟已平衡。','gmx-check'],
    ['rms','结构均方根偏差 RMSD','Root-mean-square deviation','gmx rms -s md.tpr -f md.xtc -o rmsd.xvg','以 md.tpr 结构为参照，对轨迹进行拟合并计算 RMSD。','交互选择拟合组和计算组；先处理跨周期边界断裂，报告参考结构和所选原子。','gmx-rms'],
    ['rmsf','原子均方根波动 RMSF','Root-mean-square fluctuation','gmx rmsf -s md.tpr -f md.xtc -o rmsf.xvg','计算选定原子的时间波动，选择需要的原子组。','先确认对齐和 PBC 处理；区分原子级与残基平均结果。','gmx-rmsf'],
    ['gyrate','回转半径','Radius of gyration','gmx gyrate -s md.tpr -f md.xtc -o gyrate.xvg','计算所选分子组随时间变化的质量加权回转半径。','分子应跨周期边界保持完整；确认选择组、时间窗口和质量信息。2024 起该工具采用新实现。','gmx-gyrate'],
    ['trjwhole','修复跨边界断裂的分子','Make molecules whole','gmx trjconv -s md.tpr -f md.xtc -o whole.xtc -pbc whole','按拓扑把每一帧中跨周期边界的分子重新拼合。','交互选择输出组；whole 只处理帧内分子完整性，扩散计算还需考虑跨帧位移。','gmx-trjconv'],
    ['trjnojump','展开跨帧周期跳跃','Remove trajectory jumps','gmx trjconv -s md.tpr -f whole.xtc -o nojump.xtc -pbc nojump','根据相邻帧消除跨周期边界跳跃，供扩散分析检查。','采样间隔过大可能无法可靠重建；核对初始参考和盒子变化，不要将居中轨迹直接视为无跳跃轨迹。','gmx-trjconv'],
    ['energy-temp','导出温度时间序列','Extract temperature','gmx energy -f md.edr -o temperature.xvg','从能量文件交互选择 Temperature 并输出时间序列。','核对温度组、单位和分析时段；温度稳定本身不足以证明所有自由度已平衡。','gmx-energy'],
    ['energy-density','导出密度时间序列','Extract density','gmx energy -f md.edr -o density.xvg','从 NPT 能量文件交互选择 Density 并输出时间序列。','密度项须存在于 EDR；结合体积、温度和独立时间段检查平衡。','gmx-energy']
  ];
  for (const [id,title,en,code,meaning,check,doc] of gromacs) {
    const t=flow('gmx-extra-'+id,'GROMACS','独立轨迹分析','GROMACS：'+title,'GROMACS: '+en,meaning,meaning,meaning,
      ['相匹配的轨迹和 TPR；energy 命令使用 EDR','GROMACS 可执行环境'],[
        step('运行分析','Run analysis',meaning,[command(meaning,code)],'命令输出的轨迹、日志或 XVG 数据。',check)
      ],['样例路径应替换为实际文件；版本变化时先运行相应命令的 -h。'],'分析任务 / Analysis');
    t.reference='https://manual.gromacs.org/current/onlinehelp/'+doc+'.html'; tasks.push(t);
  }
})();
