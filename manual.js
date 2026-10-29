/* Task-centered workflows. Each command has a named purpose, output, and check. */
const command = (purpose, code) => ({ purpose, code });
const step = (title, en, purpose, commands, output, check) => ({ title, en, purpose, commands, output, check });
const flow = (id, software, group, title, en, summary, summaryEn, objective, inputs, steps, cautions = [], level = '实操流程 / Workflow') => ({
  id, software, group, title, en, summary, summaryEn, objective, inputs, steps, cautions, level,
  source: 'Zhilong Wang（汪志龙）'
});

window.MANUAL = [
  flow('linux-job','Linux','集群使用','集群任务：登录、提交、跟踪与验收','HPC job: connect, submit, monitor, and verify',
    '从登录集群到确认作业完成，走完一次规范的 HPC 任务生命周期。',
    'Follow an HPC job from cluster login through submission, monitoring, and output verification.',
    '用调度器提交计算，定位日志，并在程序结束后核实结果，而不是只看任务是否离开队列。',
    ['集群账号和登录地址','计算输入文件','符合本机调度器要求的作业脚本 run.sh'],[
      step('登录计算集群','Connect to the cluster','进入登录节点；登录节点用于准备和提交，不用于运行长时间计算。',[
        command('建立 SSH 会话','ssh username@cluster.example.edu')],'远程 shell 会话。','核对主机名和管理员提供的 SSH 指纹。'),
      step('查看节点资源和调度器','Inspect resources and scheduler','确认 CPU、内存和队列状态，选择与本机一致的调度器。',[
        command('查看 CPU 型号、核数与线程','lscpu'),
        command('查看内存与 swap','free -h'),
        command('查看 Slurm 作业队列','squeue -u \"$USER\"')],'资源概况和当前 Slurm 队列。','PBS/Torque 集群用 qstat -u \"$USER\" 查看队列。'),
      step('检查工作目录和输入','Check job directory and inputs','确定脚本执行目录，并检查所需输入均已就位。',[
        command('进入任务目录','cd /path/to/job'),
        command('显示当前目录','pwd'),
        command('列出输入文件及大小','ls -lh')],'POSCAR/INCAR 等输入文件和作业脚本。','作业脚本中的相对路径应相对提交目录正确解析。'),
      step('通过 Slurm 提交计算','Submit with Slurm','由调度器按作业脚本申请资源并启动计算。',[
        command('提交作业并取得 job ID','sbatch run.sh')],'Slurm job ID。','PBS/Torque 使用 qsub run.sh；记录 job ID 供后续查询。'),
      step('查看排队状态','Monitor queue status','区分等待资源、运行中和已完成状态。',[
        command('查询当前用户的 Slurm 作业','squeue -u \"$USER\"')],'作业状态、运行时间与分配节点。','队列中没有该任务时，不代表任务成功；继续检查日志和退出状态。'),
      step('检查作业日志','Inspect the job log','查看日志末尾，定位正常结束、输入错误或运行时错误。',[
        command('查看 Slurm 输出文件最后 80 行','tail -n 80 slurm-<jobid>.out')],'日志末尾的程序信息和报错。','把 <jobid> 替换成实际作业编号，日志文件名按 run.sh 设置调整。'),
      step('核实作业状态与科学输出','Verify job completion and outputs','将调度器完成状态与程序收敛、预期输出文件交叉检查。',[
        command('查询 Slurm 作业资源使用和退出状态','sacct -j <jobid> --format=JobID,State,Elapsed,MaxRSS'),
        command('检查当前结果文件','ls -lh')],'作业结束状态和生成的计算文件。','以 VASP 收敛、Gaussian 正常终止或 GROMACS checkpoint/日志为准；任务消失不等同于计算成功。')
    ],['示例使用 Slurm；PBS 命令不能和 Slurm 命令混用。','不要在登录节点启动大型 VASP、Gaussian 或长时间 GROMACS 任务。'],'基础 / Beginner'),

  flow('linux-files','Linux','文件与环境','文件传输、存储检查与归档','File transfer, storage checks, and archiving',
    '将计算目录传到集群、检查磁盘空间，并在确认结果后归档。',
    'Transfer calculation files, check storage, and archive verified outputs.',
    '避免传输中断、目标磁盘写满和过早删除续算文件。',
    ['本地计算目录','远程服务器目录','SSH 登录权限'],[
      step('检查源目录大小和目标盘空间','Check source size and destination space','先确认要传的目录大小小于目标文件系统剩余空间。',[
        command('统计计算目录大小','du -sh ./job'),
        command('查看目标文件系统空间','df -h /path/to/job')],'目录体积与目标挂载点剩余空间。','在目标服务器运行 df 命令；不要把登录盘和 scratch 盘混为一谈。'),
      step('传输单个输入文件','Copy one input file','scp 适合少量输入文件或单个小结果。',[
        command('通过 SSH 复制 POSCAR','scp POSCAR username@cluster.example.edu:/path/to/job/')],'远程目标目录中的 POSCAR。','核对服务器地址、账号和目标路径。'),
      step('同步整个任务目录','Synchronize a directory','rsync 支持显示进度，并可在中断后再次同步。',[
        command('同步目录内容并显示传输进度','rsync -avP ./job/ username@cluster.example.edu:/path/to/job/')],'目标目录中的任务文件副本。','源路径末尾的斜杠表示同步目录内容；大型数据可先 dry-run 检查文件列表。'),
      step('归档已确认的结果','Archive verified results','只把明确选择的结果目录打包，便于备份和下载。',[
        command('压缩指定计算目录','tar -czf results.tar.gz calc1 calc2'),
        command('列出压缩包内容进行核验','tar -tzf results.tar.gz')],'压缩包和包内文件清单。','WAVECAR、CHGCAR、Gaussian checkpoint、GROMACS 轨迹可能是后续所需文件；确认备份可读后再清理。')
    ],['Windows 下列出最大文件可用 PowerShell 的 Get-ChildItem；Linux 上可用 find。'],'基础 / Beginner'),

  flow('vasp-core','VASP','第一性原理基础','VASP：结构优化到静态自洽','VASP: geometry optimization to static SCF',
    '先优化结构、检查力收敛，再用固定结构计算自洽电荷，为能带、DOS、Bader 等性质计算提供基态。',
    'Relax the geometry, verify force convergence, then run a static SCF as the starting point for property calculations.',
    '获得可复用的 CONTCAR、WAVECAR 和 CHGCAR，并保证结构、赝势、元素顺序和数值精度一致。',
    ['POSCAR：晶胞、元素和原子坐标','POTCAR：元素顺序与 POSCAR 完全一致','KPOINTS：经收敛检查的 k 网格','INCAR 和调度脚本'],[
      step('确认结构和元素顺序','Validate structure and element order','POSCAR 元素顺序决定 POTCAR 拼接顺序，原子数必须匹配。',[
        command('查看 POSCAR 头部、元素与计数','head -n 8 POSCAR')],'晶格、元素符号、原子数和坐标模式。','确认单位、真空层、固定原子标记和 POTCAR 元素块顺序。'),
      step('准备赝势与 k 点','Prepare POTCAR and KPOINTS','按 POSCAR 的元素顺序生成 POTCAR，并为晶胞建立 k 点网格。',[
        command('启动 VASPKIT 交互菜单','vaspkit')],'POTCAR 和 KPOINTS。','选择适合 VASP 许可的赝势；不同泛函需使用匹配赝势。k 网格要做收敛测试。'),
      step('设置并运行几何优化','Set up and run relaxation','决定优化原子、晶胞形状或体积；下面只是 INCAR 骨架。',[
        command('结构优化的关键 INCAR 示例','IBRION = 2\\nISIF   = 3\\nNSW    = 100\\nEDIFF  = 1E-5\\nEDIFFG = -0.02\\nENCUT  = <converged value>'),
        command('通过 Slurm 提交优化','sbatch run.sh')],'OUTCAR、OSZICAR 和最终 CONTCAR。','slab 有真空层时通常固定面内晶格，慎用会改变晶胞的 ISIF；ENCUT、U、磁性、ISMEAR 都需按体系验证。'),
      step('检查结构优化收敛','Verify relaxation convergence','确认优化终止原因、最大力和电子步收敛。',[
        command('查找收敛提示与末步力信息','grep -E \"reached required accuracy|F=|FORCES: max atom\" OUTCAR | tail -n 12')],'力收敛提示和末步能量。','不收敛时先检查电子迭代、结构振荡和约束；不要将未收敛 CONTCAR 当作最终结构。'),
      step('将最终结构用于静态计算','Use the relaxed structure for static SCF','静态计算使用优化后的坐标，保持精度和物理模型一致。',[
        command('复制最终结构作为静态 POSCAR','cp ../opt/CONTCAR POSCAR'),
        command('静态计算 INCAR 的关键设置','IBRION = -1\\nNSW    = 0\\nICHARG = 2\\nISTART = 0\\nEDIFF  = 1E-6\\nLCHARG = .TRUE.\\nLWAVE  = .TRUE.'),
        command('提交静态自洽任务','sbatch run.sh')],'静态 CHGCAR、WAVECAR、OUTCAR。','检查电子自洽收敛、费米能级和磁矩；保存该阶段全部输入文件。')
    ],['源材料以 PBE+U 为例；U 值和其他输入都是体系相关的，不要直接复制为通用参数。'],'基础 / Core workflow'),

  flow('vasp-band','VASP','能带与态密度','VASP：能带结构计算','VASP: band-structure calculation',
    '从收敛 SCF 复制结构、电荷和波函数，生成高对称 k 路径后做非自洽能带计算。',
    'Reuse a converged SCF state, generate a high-symmetry k path, and perform a non-self-consistent band run.',
    '得到沿高对称路径的能量色散，识别带边、带隙和自旋通道。',
    ['已完成 VASP 结构优化和静态 SCF','SCF 的 POSCAR/POTCAR/CHGCAR/WAVECAR','按当前晶体结构生成的路径 KPOINTS'],[
      step('从结构和对称性生成 k 路径','Generate the k path','高对称路径按晶胞对称性定义，与 SCF 均匀网格不同。',[
        command('启动 VASPKIT 并选择能带路径菜单','vaspkit')],'路径 KPOINTS 或 KPATH.in。','按当前 VASPKIT 版本选择任务，检查路径端点标签和顺序。'),
      step('准备能带目录','Prepare the band directory','复制同一个基态计算的结构、赝势、电荷和波函数。',[
        command('复制 SCF 文件','cp ../scf/POSCAR ../scf/POTCAR ../scf/CHGCAR ../scf/WAVECAR .')],'能带目录中的基态文件。','将 KPOINTS 替换为高对称路径；不要混用不同磁态或不同泛函的 WAVECAR。'),
      step('设置非自洽计算','Set up the non-self-consistent run','读取 SCF 电荷密度，固定离子位置，沿路径计算本征值。',[
        command('能带 INCAR 关键设置','ISTART = 1\\nICHARG = 11\\nNSW = 0\\nLCHARG = .FALSE.\\nLWAVE = .FALSE.'),
        command('提交能带任务','sbatch run.sh')],'EIGENVAL、vasprun.xml 和 OUTCAR。','+U、自旋、SOC 等设置与产生基态的计算保持一致；按体系设置足够 NBANDS。'),
      step('提取能带数据并检查带隙','Extract and inspect band data','后处理能带本征值，绘图前确认费米能级和高对称点。',[
        command('启动 VASPKIT 能带后处理','vaspkit')],'Band.dat 或当前版本对应的能带数据。','源笔记引用菜单 21-211；菜单编号会变化。检查计算是否覆盖实际 VBM/CBM。')
    ],['能带路径不是均匀 k 网格。半导体能带隙需确认路径确实经过带边。'],'进阶 / Intermediate'),

  flow('vasp-dos','VASP','能带与态密度','VASP：总 DOS 与分波 DOS','VASP: total and projected DOS',
    '使用均匀 k 网格和收敛电荷密度，分别输出总态密度及元素/轨道分波态密度。',
    'Use a uniform k mesh and converged density to calculate total and projected density of states.',
    '分析带隙、费米能级附近电子态以及元素/轨道贡献。',
    ['已收敛 SCF 的 CHGCAR/WAVECAR','均匀 k 网格（与能带路径不同）','DOS INCAR 与对应结构/赝势'],[
      step('生成均匀 DOS 网格','Generate a uniform DOS mesh','DOS 积分通常使用均匀 k 点，不使用能带路径。',[
        command('启动 VASPKIT 的 KPOINTS 生成菜单','vaspkit')],'均匀网格 KPOINTS。','对金属尤其要测试 k 点和展宽；确认网格密度足够。'),
      step('准备 DOS 输入文件','Prepare DOS input files','复制同一基态计算的结构、赝势和波函数/电荷文件。',[
        command('复制 SCF 文件','cp ../scf/POSCAR ../scf/POTCAR ../scf/CHGCAR ../scf/WAVECAR .')],'DOS 计算目录中的 SCF 文件。','确认是同一结构、泛函、磁态和 U 设置。'),
      step('设置并运行 DOS','Set up and run DOS','固定电荷密度并开启轨道投影，输出足够细的能量网格。',[
        command('DOS INCAR 示例骨架','ISTART = 1\\nICHARG = 11\\nNSW = 0\\nLORBIT = 11\\nNEDOS = 2001\\nLCHARG = .FALSE.\\nLWAVE = .FALSE.'),
        command('提交 DOS 任务','sbatch run.sh')],'DOSCAR 和 OUTCAR。','ISMEAR/SIGMA 与体系类型匹配；NEDOS 不能替代 k 点收敛测试。'),
      step('分别导出 TDOS 和 PDOS','Export total and projected DOS','后处理总态密度和元素/轨道投影数据。',[
        command('启动 VASPKIT DOS 后处理','vaspkit')],'TDOS/PDOS 数据文件。','来源菜单 11-111/11-116 需按版本确认；统一能量零点并标出费米能级。')
    ],['源案例中的 NEDOS、ISMEAR、SIGMA 不是通用默认值。'],'进阶 / Intermediate'),

  flow('vasp-hse','VASP','能带与态密度','VASP：HSE06 自洽到性质计算','VASP: HSE06 SCF and property calculations',
    '用已验证的 PBE 结构/波函数启动 HSE 自洽，再从 HSE 基态准备 HSE 能带或 DOS。',
    'Start HSE from a validated PBE structure, converge HSE self-consistency, then calculate HSE bands or DOS.',
    '清楚区分 PBE 起始猜测与 HSE 最终电子密度，避免把不同泛函的输出文件交叉混用。',
    ['收敛的 PBE 结构和静态 SCF','HSE 专用 INCAR/KPOINTS','足够的空带数和 HSE 计算资源'],[
      step('确认 PBE 结构和基态','Validate PBE geometry and ground state','确认结构、磁态、U、赝势和 k 网格已验证。',[
        command('查看 PBE 收敛信息','grep -E \"reached required accuracy|E0=|mag=\" OUTCAR OSZICAR | tail -n 20')],'已确认的几何结构和基态信息。','PBE 计算未收敛时不要进入 HSE。'),
      step('准备 HSE 自洽起始文件','Prepare HSE starting files','可用 PBE WAVECAR/CHGCAR 作为初猜，HSE 阶段自身必须完成自洽。',[
        command('复制 PBE-SCF 起始文件','cp ../PBE-scf/POSCAR ../PBE-scf/POTCAR ../PBE-scf/CHGCAR ../PBE-scf/WAVECAR .'),
        command('HSE INCAR 的方法标识示例','LHFCALC = .TRUE.\\nHFSCREEN = 0.2\\nNSW = 0\\n# Choose a validated HSE algorithm and precision settings.'),
        command('提交 HSE 自洽','sbatch run.sh')],'HSE-SCF 的 WAVECAR、CHGCAR、OUTCAR。','具体算法、PRECFOCK、NBANDS 和混合设置按 VASP 版本及体系验证。'),
      step('检查 HSE 自洽和带数','Check HSE convergence and bands','确认电子收敛、能量稳定、空带数足够。',[
        command('查看 HSE 收敛与 NBANDS 信息','grep -E \"reached required accuracy|aborting loop|NBANDS|E0=\" OUTCAR | tail -n 30')],'HSE 收敛记录。','本地 HSE 示例含重复 ALGO 行和需核验的 LMAXMIN；不要不经审查直接复用。'),
      step('从 HSE 基态准备性质目录','Prepare property calculations from HSE SCF','复制 HSE-SCF 输出作为 HSE 性质计算起点，再生成相应路径/均匀网格。',[
        command('复制 HSE-SCF 结构、电荷与波函数','cp ../HSE-scf/POSCAR ../HSE-scf/POTCAR ../HSE-scf/CHGCAR ../HSE-scf/WAVECAR .')],'HSE 性质目录中与 HSE 方法一致的文件。','原始 readme 将 PBE-DOS 的 CHG/WAVECAR 复制到 HSE-DOS；此处标为待核对，不沿用混用方式。'),
      step('运行并核验 HSE 性质','Run and validate HSE property calculation','按 HSE 方法计算目标性质并检查输出来源一致。',[
        command('提交作业','sbatch run.sh')],'HSE 能带或 DOS 数据。','源案例 ENCUT=400 eV、U=3.5 eV 等均为个案；先做收敛测试。')
    ],['杂化泛函计算成本高；先用小体系试算和资源评估。'],'进阶 / Advanced'),

  flow('vasp-aimd','VASP','分子动力学','VASP：AIMD 升温、平衡和生产采样','VASP: AIMD heating, equilibration, and production',
    '将 AIMD 分成升温、目标温度平衡和生产轨迹，按步数与时间步长核对真实模拟时长。',
    'Separate AIMD into heating, target-temperature equilibration, and production; calculate the actual trajectory length.',
    '得到温度稳定、采样充分且可用于结构或扩散分析的轨迹。',
    ['已优化的结构','与体系匹配的 AIMD INCAR','足够的计算预算与轨迹存储空间'],[
      step('制定温度和时间计划','Plan temperature and simulation time','用 NSW 和 POTIM 计算总时长，避免把步数误当成 ps。',[
        command('计算 AIMD 总时间','total_time_ps = NSW * POTIM_fs / 1000\\n# Example: 30000 steps * 1 fs = 30 ps')],'目标温度、步长、步数和总时长。','轻元素、键振动和体系大小会限制稳定时间步；先做短试算。'),
      step('执行升温阶段','Run the heating stage','从较低温度逐渐升到目标温度，减少突然升温引起的结构冲击。',[
        command('AIMD 升温 INCAR 示例','IBRION = 0\\nNSW = 1000\\nPOTIM = 1\\nMDALGO = 2\\nSMASS = 0\\nTEBEG = 100\\nTEEND = 1000'),
        command('提交升温作业','sbatch run.sh')],'升温轨迹、最终 CONTCAR 和日志。','来源示例采用 VASP 特定温控设置；确认系综、温控算法与目标物理问题一致。'),
      step('检查温度和结构稳定性','Check temperature and structure stability','判断温度是否到位、能量是否异常漂移、结构是否发生预期变化。',[
        command('查看 OSZICAR 末尾','tail -n 40 OSZICAR')],'末段能量/温度信息。','如果温度持续漂移或结构出现非物理断键，先修正方案再进入生产阶段。'),
      step('在目标温度下平衡','Equilibrate at target temperature','以升温末态为初始结构，在目标温度继续演化；平衡段不计入生产统计。',[
        command('复制升温后的结构','cp ../heat/CONTCAR POSCAR'),
        command('设置目标温度示例','IBRION = 0\\nNSW = 5000\\nPOTIM = 1\\nTEBEG = 1000\\nTEEND = 1000'),
        command('提交平衡作业','sbatch run.sh')],'目标温度下的平衡轨迹。','是否续接 WAVECAR/CHGCAR 要与 ISTART/ICHARG 配套；保留文件来源记录。'),
      step('运行生产轨迹并做采样检查','Run production and assess sampling','平衡后生成用于分析的长轨迹；评估采样相关时间和独立重复。',[
        command('按 1 fs、30 ps 设置生产步数','NSW = 30000\\nPOTIM = 1\\nTEBEG = 1000\\nTEEND = 1000'),
        command('提交生产作业','sbatch run.sh')],'XDATCAR、OUTCAR 和完整作业日志。','30 ps 是案例示例而非保证充分；扩散、相变等问题需要系统评估采样和有限尺寸效应。'),
      step('分析扩散或热稳定性','Analyze diffusion or thermal stability','按研究问题计算结构统计、MSD 或扩散系数。',[
        command('启动当前版本的 VASPKIT','vaspkit')],'轨迹分析数据。','来源提到 VASPKIT 72-723；菜单随版本变化。MSD 要在扩散线性区间拟合并报告不确定性。')
    ],['每个温度 30–100 ps 是原作者经验，不是普适采样标准。'],'进阶 / Advanced'),

  flow('vasp-neb','VASP','反应路径','VASP：CI-NEB 过渡态路径','VASP: climbing-image NEB pathway',
    '依次优化端点、检查原子对应关系、插入图像、运行 CI-NEB 并核验能量路径与力。',
    'Optimize endpoints, verify atom mapping, create images, run CI-NEB, and validate forces and the energy path.',
    '获得端点之间收敛的最小能量路径和能垒估计。',
    ['已优化的初态/末态 CONTCAR 和 OUTCAR','VASP 编译时加入的匹配版本 VTST 工具','统一的 POTCAR、KPOINTS 和 NEB INCAR'],[
      step('检查初末态原子映射','Verify endpoint atom mapping','确认相同编号代表同一个原子；错位会导致错误插值。',[
        command('比较两个端点','dist.pl init/CONTCAR end/CONTCAR')],'端点位移/匹配检查。','先核对原子数、元素顺序和原子编号；不能只凭一个总位移阈值判断。'),
      step('插入中间图像','Generate intermediate images','按反应坐标插值生成中间结构目录。',[
        command('插入 3 个中间图像','nebmake.pl init/CONTCAR end/CONTCAR 3')],'00、01、02、03、04 共 5 个目录。','VASP 的 IMAGES=中间图像数；本例应设置 IMAGES=3。'),
      step('复制端点参考 OUTCAR','Copy endpoint reference outputs','为路径分析提供初态和末态计算能量。',[
        command('复制初态 OUTCAR','cp init/OUTCAR 00/'),
        command('复制末态 OUTCAR','cp end/OUTCAR 04/')],'00/OUTCAR 与 04/OUTCAR。','确认它们与插点端点结构完全对应。'),
      step('设置并提交 CI-NEB','Configure and submit CI-NEB','启用 VTST 优化和 climbing image，并按反应精度设置电子/离子收敛。',[
        command('NEB INCAR 示例骨架','ICHAIN = 0\\nIMAGES = 3\\nLCLIMB = .TRUE.\\nSPRING = -5\\nIBRION = 3\\nPOTIM = 0\\nIOPT = 1\\nEDIFF = 1E-7\\nEDIFFG = -0.03'),
        command('提交 NEB 作业','sbatch run.sh')],'各图像的 OUTCAR、能量与力。','IOPT 和并行方式随 VTST/VASP 版本与集群变化，核对本机编译信息。'),
      step('检查收敛和反应能垒','Check convergence and barrier','检查最大力、能量曲线连续性和最高能图像。',[
        command('用 VTST 脚本查看路径','nebef.pl')],'沿路径的能量、相对能量和最大力。','收敛后仍应确认过渡态特征；必要时增加图像或用其他方法精修。')
    ],['不能将 IMAGES 写成插点前后的目录总数。'],'进阶 / Advanced'),

  flow('vasp-bader','VASP','电荷分析','VASP：Bader 电荷','VASP: Bader charge analysis',
    '开启 LAECHG 输出参考电荷，合并 AECCAR 文件，再运行 Bader 分区并定义电荷符号。',
    'Write reference densities, sum AECCAR files, run Bader partitioning, and state the charge-sign convention.',
    '得到逐原子电子数和一致、可解释的净电荷转移结果。',
    ['结构一致的静态 SCF 输入','Bader 程序','VTST 的 chgsum.pl'],[
      step('重新做带全电子参考的静态计算','Run static VASP with reference density','在结构和精度匹配的静态计算中生成 AECCAR0/2。',[
        command('打开 LAECHG 并关闭离子移动','LAECHG = .TRUE.\\nNSW = 0'),
        command('提交静态任务','sbatch run.sh')],'CHGCAR、AECCAR0、AECCAR2。','确保输入与要分析的结构/磁性状态一致。'),
      step('合并 PAW 参考电荷','Sum PAW reference densities','将原子核与价电子参考密度组合为分区参考。',[
        command('生成 CHGCAR_sum','chgsum.pl AECCAR0 AECCAR2')],'CHGCAR_sum。','文件必须来自同一次计算；检查脚本执行成功。'),
      step('运行 Bader 分区','Run Bader partitioning','将 CHGCAR 按参考电荷密度划分原子盆地。',[
        command('执行 Bader','bader CHGCAR -ref CHGCAR_sum')],'ACF.dat、BCF.dat、AVF.dat。','确认输出原子数与 POSCAR 一致，电荷总量与体系价电子数相容。'),
      step('解释并报告净电荷','Interpret and report charges','按 POTCAR 的 ZVAL 参照计算净得失电子。',[
        command('检查逐原子分区结果','less ACF.dat')],'逐原子电子数和盆地信息。','说明正负号定义；Bader 电荷不等同于形式氧化态。')
    ],['不同赝势版本的价电子数不同，比较时需统一参照。'],'进阶 / Intermediate'),

  flow('vasp-diff','VASP','电荷分析','VASP：差分电荷密度','VASP: charge-density difference',
    '在相同晶胞、FFT 网格和设置下计算完整体系与两个片段的密度，再计算 Δρ 并可视化。',
    'Calculate the combined system and fragments on a matching grid, subtract their densities, and visualize Δρ.',
    '得到成键/吸附导致的电荷积累与耗尽分布。',
    ['优化后的完整吸附结构','基底与吸附物的原子列表','三次静态计算可比的电子结构设置'],[
      step('保存完整体系电荷密度','Save total-system density','对完整吸附体系做静态计算并保留 CHGCAR。',[
        command('保存总体系电荷','cp CHGCAR total.CHGCAR')],'total.CHGCAR。','记录晶胞、ENCUT、KPOINTS 和 FFT 网格。'),
      step('建立固定坐标的基底片段','Build the substrate fragment','在完整吸附结构中只删除吸附物原子，不重新优化基底坐标。',[
        command('从完整 CONTCAR 建立片段 POSCAR','cp CONTCAR ../base/POSCAR')],'基底单点计算 POSCAR。','只修改相应元素计数和坐标；检查剩余原子次序。'),
      step('建立固定坐标的吸附物片段','Build the adsorbate fragment','保留吸附物坐标并删除基底原子，仍使用相同晶胞。',[
        command('建立吸附物片段 POSCAR','cp CONTCAR ../adsorbate/POSCAR')],'吸附物单点计算 POSCAR。','同样不要重新优化；三份结构必须使用相同晶胞和空间网格。'),
      step('执行两个片段的单点计算','Run both fragment single points','分别计算基底和吸附物的 CHGCAR。',[
        command('片段单点关键条件','NSW = 0\\n# Match ENCUT, k mesh, FFT grid, cell, and precision.'),
        command('提交片段单点作业','sbatch run.sh')],'base.CHGCAR 与 adsorbate.CHGCAR。','片段电荷/自旋设置应与研究定义一致；检查三份电荷密度网格相同。'),
      step('相减并绘制等值面','Subtract and visualize','按 Δρ=ρ(total)−ρ(base)−ρ(adsorbate) 计算体数据。',[
        command('在 VESTA 中计算体数据','Utilities → 3D Data → Calculate\\nρ(total) - ρ(base) - ρ(adsorbate)')],'差分电荷网格和等值面图。','标明等值面正负颜色和 Δρ 定义，保留源 CHGCAR。')
    ],['坐标、晶胞、FFT 网格或计算设置不同，逐点相减就失去物理意义。'],'进阶 / Intermediate'),

  flow('vasp-oer','VASP','电催化','VASP：OER 吸附自由能图','VASP: OER free-energy diagram',
    '优化洁净 slab 和四个反应态，逐项计算电子能与热修正，再用 CHE 计算电位依赖自由能。',
    'Optimize the clean slab and intermediates, calculate electronic and thermochemical terms, then apply the CHE model.',
    '建立可追溯的 *、*OH、*O、*OOH 自由能图并定位潜在决定步骤。',
    ['明确的晶面、slab 厚度、真空和固定层','四个表面态结构','一致的能量和振动修正参考'],[
      step('建立和收敛洁净 slab','Build and converge the clean slab','选择表面晶格、层数、真空厚度和固定层，并做 slab 模型收敛。',[
        command('固定面内晶格、优化原子示例','ISIF = 2\\nIBRION = 2\\nNSW = 100'),
        command('提交洁净 slab 优化','sbatch run.sh')],'收敛的 slab 结构和总能量。','原始笔记写 ISIF=3；有真空的表面需避免无意改变晶胞和真空层。'),
      step('分别建立 *OH、*O、*OOH 并优化','Build and optimize adsorbed states','在相同 slab 上建立吸附态，保持相同约束、磁性和数值精度。',[
        command('为每个吸附态运行 VASP 优化','sbatch run.sh')],'四个表面态的收敛 CONTCAR 与能量。','检查吸附位点、覆盖度、固定层和虚假构型；保存各态独立目录。'),
      step('计算零点能与熵修正','Calculate ZPE and entropy corrections','按振动频率和所选热力学模型计算 ΔZPE 与 −TΔS。',[
        command('有限差分振动示例设置','IBRION = 5\\nNFREE = 2')],'频率、零点能及熵修正。','原文给出参数但未给出完整振动流程；确认受振原子、虚频和频率缩放。'),
      step('逐步计算 CHE 自由能','Calculate CHE step free energies','逐个反应步组装 DFT 能量、热修正和电位项。',[
        command('CHE 公式和四个 PCET 步骤','ΔG(U) = ΔE_DFT + ΔZPE − TΔS − n e U\\n* + H2O → *OH + (H+ + e-)\\n*OH → *O + (H+ + e-)\\n*O + H2O → *OOH + (H+ + e-)\\n*OOH → * + O2 + (H+ + e-)')],'每一步的 ΔG(U) 表。','逐项核对原子/质子/电子配平、参考能量、标准态和符号。'),
      step('绘制自由能图并检查闭合','Plot and validate the free-energy diagram','绘制累计自由能，比较零电位和目标电位。',[
        command('整理绘图数据列','state, E_DFT, ZPE, -T*S, ΔG(U)')],'OER 自由能图、决定步骤和过电位估计。','检查能量基准和图中单位；对修正参数做敏感性分析。')
    ],['原始 O2/H2/H2O 参考能量属于特定案例，不能直接当作通用值。'],'研究流程 / Research'),

  flow('vasp-hse','VASP','进阶方法','VASP：HSE06 能带/DOS','VASP: HSE06 bands and DOS',
    '按 PBE 结构/SCF、HSE SCF、HSE 性质计算的顺序组织目录，并核实所有性质文件来自 HSE。',
    'Organize PBE structure/SCF, HSE SCF, then HSE properties while ensuring the property files are HSE-derived.',
    '防止复制 PBE-DOS 电荷文件到 HSE-DOS；明确哪些文件是起始猜测、哪些是最终 HSE 基态。',
    ['收敛的 PBE 结构和静态 SCF','HSE INCAR 和计算资源','针对 band 或 DOS 准备的 KPOINTS'],[
      step('检查 PBE 结构与基态','Check the PBE structure and SCF','记录结构、磁态、U、赝势和 k 网格并确认收敛。',[
        command('检查收敛提示','grep -E \"reached required accuracy|E0=\" OUTCAR OSZICAR | tail -n 20')],'验证过的结构和 PBE 基态文件。','先解决 PBE 未收敛或错误磁态问题。'),
      step('从 PBE 文件启动 HSE 自洽','Start HSE self-consistency from PBE','PBE 波函数/电荷可作为初始猜测；HSE 阶段自身必须自洽。',[
        command('HSE INCAR 方法设置示意','LHFCALC = .TRUE.\\nHFSCREEN = 0.2\\nNSW = 0'),
        command('提交 HSE 自洽任务','sbatch run.sh')],'HSE-scf/CHGCAR、WAVECAR 和 OUTCAR。','原例使用的 ALGO、PRECFOCK、ENCUT、U 均需按版本和体系验证。'),
      step('核验 HSE 收敛、NBANDS 和输出','Verify HSE convergence and band count','检查迭代收敛与空带数。',[
        command('检索 HSE 关键输出','grep -E \"reached required accuracy|aborting loop|NBANDS|E0=\" OUTCAR | tail -n 30')],'HSE 自洽收敛记录。','原始 HSE-DOS 脚本引用 PBE-DOS WAVECAR/CHG；不要未经核验混用不同泛函的电荷和波函数。'),
      step('从 HSE-SCF 文件准备能带或 DOS','Prepare properties from HSE SCF','复制 HSE-SCF 文件并针对任务生成路径或均匀网格 KPOINTS。',[
        command('复制 HSE-SCF 基态文件','cp ../HSE-scf/POSCAR ../HSE-scf/POTCAR ../HSE-scf/CHGCAR ../HSE-scf/WAVECAR .'),
        command('提交 HSE 性质计算','sbatch run.sh')],'HSE band 或 DOS 输出。','HSE 杂化计算成本高；先测试 NBANDS、k 网格和内存。')
    ],['本地 1–5-INCAR 含重复 ALGO 和需核验的标签；其 ENCUT/U 值是个案。'],'进阶 / Advanced'),

  flow('vasp-optical','VASP','电子性质','VASP：光学响应与吸收系数','VASP: optical response and absorption',
    '从已收敛基态建立光学计算，测试空带数和 k 点，最后转换介电函数得到吸收谱。',
    'Start from a converged ground state, converge empty bands and k points, then derive the absorption spectrum.',
    '获得覆盖目标光子能量范围的介电函数及单位正确的吸收系数。',
    ['CONTCAR/POSCAR、POTCAR、KPOINTS','收敛的基态文件','目标泛函和光谱能量窗口'],[
      step('复用优化结构和基态设置','Reuse validated geometry and method','建立独立 optical 目录，保持与目标基态一致的结构和计算方法。',[
        command('复制优化结构','cp ../PBE-str-opt/CONTCAR POSCAR')],'optical POSCAR。','按本项目目录调整路径，明确使用 PBE 还是 HSE。'),
      step('收敛空带数和 k 网格','Converge empty bands and k mesh','增加 NBANDS 并检查介电函数/吸收谱变化。',[
        command('查看已有计算的 NBANDS','grep NBANDS OUTCAR')],'目标谱段内稳定的空带数和 k 网格。','原文 NBANDS=196 是对应 HSE 案例的两倍，不可通用照搬。'),
      step('运行光学性质计算','Run optical calculation','根据 VASP 版本设置光学矩阵元和频率采样后提交。',[
        command('提交光学作业','sbatch run.sh')],'介电函数输出。','检查输出是否覆盖目标能量范围、极化方向和光学展宽。'),
      step('从介电函数计算吸收系数','Convert dielectric function to absorption','按单位一致的关系由 ε1、ε2 导出 α(ω)。',[
        command('吸收系数关系','α(ω) = √2·ω/c · [√(ε1(ω)^2+ε2(ω)^2) − ε1(ω)]^(1/2)')],'能量—吸收系数表和绘图。','明确 ω、c 和输出能量单位的换算；原文没有提供完整后处理脚本。')
    ],['本地光学文档只有简略操作记录，没有完整 INCAR。'],'进阶 / Intermediate'),

  flow('vasp-mass','VASP','电子性质','VASP：载流子有效质量','VASP: carrier effective mass',
    '识别 VBM/CBM 与目标晶向，在带边周围生成局部 k 点并拟合 E(k) 曲率。',
    'Identify band extrema and transport directions, sample nearby k points, and fit E(k) curvature.',
    '计算电子或空穴沿不同晶向的有效质量，并报告拟合方法与窗口。',
    ['收敛能带和带边位置','带边附近的 k 点坐标','当前版本 VASPKIT/VPKIT 工具'],[
      step('定位价带顶和导带底','Locate VBM and CBM','通过能带/全布里渊区检查确认带边坐标、能带编号和自旋。',[
        command('启动能带后处理','vaspkit')],'VBM/CBM 坐标及目标能带。','如果带边不在高对称路径上，先做全布里渊区搜索。'),
      step('定义方向和局部采样','Define directions and local sampling','填写极值附近点数、采样半径及每个输运方向。',[
        command('填写 VPKIT.in 任务字段','mode=1  # generate local k-points\\npoints=6\\nradius=0.015\\n# list start/end k-point coordinates for each direction')],'局部 k 点任务定义。','这些字段按源文档描述示意；具体格式需以安装版本模板为准。'),
      step('生成局部 KPOINTS 并运行计算','Generate local KPOINTS and calculate','按工具输出准备本征值计算文件并提交。',[
        command('启动 VASPKIT/VPKIT 生成任务','vaspkit'),
        command('提交局部采样计算','sbatch run.sh')],'带边周围 E(k) 数据。','方向示例 Γ→L、Γ→K、X→W、X→Γ 只适用于源中的 Si 案例。'),
      step('拟合曲率并做窗口敏感性分析','Fit curvature and test fit window','运行分析模式并改变窗口检查拟合稳定性。',[
        command('运行有效质量分析模式','vaspkit')],'方向相关电子/空穴有效质量。','确认单位、拟合阶数、带边位置和坐标系；报告拟合区间。')
    ],['源文档提到菜单 91-912/913，编号须按当前版本复核。'],'进阶 / Intermediate'),

  flow('vasp-cohp','VASP','化学键分析','VASP + LOBSTER：COHP/ICOHP','VASP + LOBSTER: COHP/ICOHP',
    '准备适合投影的 VASP 波函数，运行 LOBSTER，并依据文件头绘制指定原子对的 COHP。',
    'Prepare projection-compatible VASP wavefunctions, run LOBSTER, and plot pair-resolved COHP curves.',
    '解释能量分辨的成键/反键贡献和积分 COHP，并检查投影误差。',
    ['匹配版本的 VASP 和 LOBSTER','WAVECAR/结构信息','lobsterin 中的原子对和基组定义'],[
      step('为 LOBSTER 准备 VASP 输出','Prepare VASP outputs for LOBSTER','按 LOBSTER 指南准备波函数、结构和足够能带。',[
        command('输出波函数的 INCAR 设置示意','LWAVE = .TRUE.\\nLCHARG = .TRUE.\\n# Converge NBANDS and basis for the selected LOBSTER version.'),
        command('提交 VASP 基态作业','sbatch run.sh')],'WAVECAR 和结构/电荷输出。','本地 COHP 文档没有完整输入步骤；用对应版本手册确定所需文件。'),
      step('定义键对并运行 LOBSTER','Select pairs and run LOBSTER','通过 lobsterin 选定原子对及基组，执行投影分析。',[
        command('运行 LOBSTER','lobster')],'COHPCAR.lobster、ICOHPLIST.lobster 等。','检查 charge spilling / 投影误差和原子编号。'),
      step('核对列说明并解释符号','Check columns and sign convention','根据文件头确认能量、COHP/ICOHP 的列和积分方向。',[
        command('查看输出文件头','head -n 20 COHPCAR.lobster')],'原子对的 COHP/ICOHP 曲线和能量列。','源笔记中的前几列描述可能依版本/输出类型变化；以文件头和官方手册为准。')
    ],['绘图时标出采用 COHP 或 −COHP 的符号约定。'],'进阶 / Intermediate'),

  flow('gaussian-cube','Gaussian','性质后处理','Gaussian：CHK 转换与 Cube 可视化','Gaussian: checkpoint conversion and cube visualization',
    '从已完成的 Gaussian 计算取出 checkpoint，生成 FCHK，再分别导出密度或静电势网格。',
    'Convert a completed calculation checkpoint to FCHK, then export density or electrostatic-potential grids.',
    '得到可在 GaussView/VESTA 中绘制的电子密度和静电势 cube 文件。',
    ['有效的 job.chk','formchk 和 cubegen 可执行程序','足够的磁盘空间'],[
      step('转换 checkpoint 格式','Convert checkpoint format','将二进制 checkpoint 转为 formatted checkpoint，供网格工具读取。',[
        command('转换 job.chk 到 job.fchk','formchk job.chk job.fchk')],'job.fchk。','检查文件非空且来自目标计算。'),
      step('生成总电子密度 Cube','Generate electron-density cube','对 SCF 总电子密度做空间网格化。',[
        command('导出密度','cubegen 1 density=scf job.fchk density.cube')],'density.cube。','cube 网格精度会影响文件大小和表面光滑度。'),
      step('生成静电势 Cube','Generate electrostatic-potential cube','将静电势映射到三维网格。',[
        command('导出静电势','cubegen 1 potential=scf job.fchk esp.cube')],'esp.cube。','在可视化软件中核对单位、色标和表面等值。')
    ],['原始命令使用 1.fchk 示例文件名；本页统一为 job.fchk。'],'基础 / Beginner'),

  flow('gaussian-restart','Gaussian','作业管理','Gaussian：从 checkpoint 续算优化','Gaussian: restart an optimization',
    '先检查任务停止原因和 checkpoint，再编写 opt=restart 输入并通过队列提交。',
    'Inspect the stop reason and checkpoint, then submit a restart input using opt=restart.',
    '避免从头重新计算，并确认最终几何满足优化收敛条件。',
    ['原计算的 job.chk 与 job.log','原任务的电荷、多重度与 route section','集群 Gaussian 作业脚本'],[
      step('检查日志和 checkpoint','Inspect log and checkpoint','先判定是正常停止、墙钟中断还是 SCF/优化错误。',[
        command('查看日志末尾','tail -n 60 job.log'),
        command('确认 checkpoint 文件存在','ls -lh job.chk')],'停止原因、日志和 checkpoint。','如果原任务存在输入/SCF 错误，修复问题再续算。'),
      step('编写 opt=restart 输入','Write restart input','指向原 checkpoint 并请求继续几何优化。',[
        command('Gaussian 续算输入骨架','%chk=job.chk\\n# opt=restart\\n\\nRestart geometry optimization\\n\\n')],'restart.gjf 或对应输入文件。','先备份唯一 checkpoint；确保续算任务与 checkpoint 类型匹配。'),
      step('提交续算并核对终止条件','Submit and verify restart','用本机调度器提交并检查正常终止与最终优化标准。',[
        command('提交 Slurm 作业','sbatch gaussian.sh')],'新日志、更新后的 checkpoint 和最终几何。','PBS 集群使用 qsub；Gaussian 必须显示正常终止且满足力/位移标准。')
    ],['原笔记中的 jobs/disown 适用于 shell 作业管理，不替代 HPC 调度器。'],'基础 / Beginner'),

  flow('orca-start','ORCA','入门示例','ORCA：建立第一个输入并检查输出','ORCA: prepare a first input and inspect output',
    '使用水分子例子认识 ORCA 输入结构、方法/基组、资源块以及输出检查。',
    'Use a water example to learn the ORCA input layout, method/basis, resource block, and output checks.',
    '从示例出发理解输入格式；生产任务前按研究问题选择方法和基组。',
    ['ORCA 安装路径和合法使用权限','water.inp','配置好的 MPI/并行环境（如使用）'],[
      step('写入计算方法和资源限制','Set method and resource limits','route 行指定 DFT 方法与基组，pal/maxcore 设置示例资源。',[
        command('输入方法与并行设置','! B3LYP def2-SVP TightSCF\\n%pal\\n  nprocs 4\\nend\\n%maxcore 1500')],'ORCA 输入文件的计算设置。','方法和基组仅为教学示例；maxcore 按每进程内存预算设置。'),
      step('写入坐标、电荷与多重度','Set coordinates, charge, and multiplicity','水分子中性单重态，坐标单位为 Å。',[
        command('水分子 xyz 输入块','* xyz 0 1\\nO 0.0000 0.0000 0.0000\\nH 0.0000 0.0000 0.9600\\nH 0.0000 0.9300 -0.2400\\n*')],'几何结构和总电荷/自旋态。','正式体系需核对电子数、电荷、自旋多重度和初始结构。'),
      step('运行并检查正常终止','Run and verify normal termination','从实际安装路径调用 ORCA 并保存输出日志。',[
        command('启动示例计算','$ORCA/orca water.inp > water.out'),
        command('定位正常终止和能量','grep -E \"FINAL SINGLE POINT ENERGY|ORCA TERMINATED NORMALLY\" water.out')],'water.out 与计算结果文件。','以集群管理员规定的 MPI 启动方式为准；检查 SCF 收敛与正常终止。')
    ],['原资料中没有 ORCA 教程；本流程是明确标注的入门示例。'],'示例 / Example'),

  flow('gmx-system','GROMACS','建模与拓扑','GROMACS：Packmol 体系与拓扑','GROMACS: Packmol box and topology',
    '按组成构建初始盒子，转换坐标，组合经过验证的分子拓扑并检查预处理器输出。',
    'Build a composition-defined box, convert coordinates, assemble validated topology, and inspect preprocessing.',
    '建立原子坐标和力场拓扑严格对应的初始分子体系。',
    ['每个组分的结构文件','验证过的 itp/力场文件','Packmol 输入文件 model.inp'],[
      step('定义组成和初始盒子','Define composition and starting box','为每种分子设置数量、分子间最小距离和盒子范围。',[
        command('Packmol 输入示意','tolerance 2.0\\nfiletype pdb\\noutput model.pdb\\nstructure Li.pdb\\n  number 63\\n  inside cube 0. 0. 0. 60\\nend structure')],'model.inp。','数量和 60 Å 盒子只来自特定 Li/FSI/THF 案例，按目标浓度和密度重新设计。'),
      step('生成并转换结构','Pack and convert coordinates','用 Packmol 摆放分子，再将 PDB 转成 GRO。',[
        command('运行 Packmol','packmol < model.inp'),
        command('转换 PDB 为 GRO','gmx editconf -f model.pdb -o input.gro')],'model.pdb 和 input.gro。','确认盒长单位为 nm；检查分子数量、总电荷和初始重叠。'),
      step('组装主拓扑分子清单','Assemble topology molecule list','主拓扑引用力场和 itp，并按坐标文件顺序列出分子种类/数量。',[
        command('主拓扑末尾的分子清单示意','[ molecules ]\\nLi 63\\nFSI 63\\nTHF 310')],'input.top。','[ molecules ] 名称、数量和顺序必须与 GRO 中分子顺序完全一致。'),
      step('运行 grompp 验证体系','Preprocess and validate the system','在正式能量最小化前检查坐标、拓扑、约束和力场参数。',[
        command('生成能量最小化 TPR','gmx grompp -f em.mdp -c input.gro -p input.top -o em.tpr')],'em.tpr 和 grompp 检查信息。','优先修复警告，不要用 -maxwarn 遮蔽拓扑、单位或参数错误。')
    ],['AutoFF/OPLS 只是来源个案；参数组合和力场适用范围需要单独验证。'],'基础 / Beginner'),

  flow('gmx-md','GROMACS','分子动力学','GROMACS：EM → NVT → NPT → 生产模拟','GROMACS: EM, NVT, NPT, and production MD',
    '每阶段都先生成 TPR、检查预处理信息、运行模拟并验证输出，再将结构传到下一阶段。',
    'For each stage, generate and inspect the TPR, run the simulation, verify outputs, then pass the structure onward.',
    '获得稳定平衡的分子体系和可分析的生产轨迹。',
    ['input.gro 与 input.top','em.mdp、nvt.mdp、npt.mdp、md.mdp','经验证的力场和调度器脚本'],[
      step('能量最小化 EM','Energy minimization','降低初始构型中的不合理接触，并检查最大力。',[
        command('生成 EM TPR','gmx grompp -f em.mdp -c input.gro -p input.top -o em.tpr'),
        command('运行 EM','gmx mdrun -deffnm em -v')],'em.gro、em.edr、em.log。','确认能量下降、最大力合理且无 LINCS/NaN 错误。'),
      step('NVT 恒容温度平衡','NVT temperature equilibration','在固定体积下调节温度，检查温度和势能稳定性。',[
        command('生成 NVT TPR','gmx grompp -f nvt.mdp -c em.gro -p input.top -o nvt.tpr'),
        command('运行 NVT','gmx mdrun -deffnm nvt')],'nvt.gro、nvt.xtc、nvt.edr。','查看温度/能量随时间；总时长由 nsteps×dt 计算。'),
      step('NPT 压力和密度平衡','NPT pressure/density equilibration','允许体系体积变化，检查密度和盒子是否稳定。',[
        command('生成 NPT TPR','gmx grompp -f npt.mdp -c nvt.gro -p input.top -o npt.tpr'),
        command('运行 NPT','gmx mdrun -deffnm npt')],'npt.gro、npt.xtc、npt.edr。','观察密度、体积、温度和能量；压力瞬时波动不等于不平衡。'),
      step('准备生产模拟','Prepare production simulation','用 NPT 平衡后的结构生成生产 TPR，核算总时长和输出大小。',[
        command('生成生产 TPR','gmx grompp -f md.mdp -c npt.gro -p input.top -o md.tpr')],'md.tpr。','检查 continuation、约束、输出频率和总模拟时长；生产轨迹需要足够长。'),
      step('运行并核验生产轨迹','Run and verify production trajectory','运行生产任务并确认模拟正常结束、轨迹完整。',[
        command('运行生产模拟','gmx mdrun -deffnm md -v')],'md.xtc、md.edr、md.log、md.gro。','集群生产计算应通过调度器运行；保留 TPR、拓扑和完整日志。')
    ],['来源 NVT/NPT 参数与 2023.5 案例相关；系综、约束、时间步长和耦合方案按模型验证。'],'基础 / Core workflow'),

  flow('gmx-rdf','GROMACS','轨迹分析','GROMACS：径向分布函数 RDF','GROMACS: radial distribution function',
    '定义中心/配对原子组和时间窗口，计算 g(r) 及可选配位数。',
    'Define atom groups and a time window, then calculate g(r) and optional coordination numbers.',
    '识别局部配位壳层和特征原子间距。',
    ['平衡后的 md.xtc','对应 md.tpr','已定义的 index.ndx'],[
      step('建立 RDF 原子组','Create RDF atom groups','用索引文件明确 RDF 中参考组和配对组。',[
        command('交互创建 index.ndx','gmx make_ndx -f md.tpr -o index.ndx')],'含目标组的 index.ndx。','确认组内原子数、残基选择和原子名称。'),
      step('计算 RDF 与配位数','Calculate RDF and coordination number','指定轨迹、分析窗口、bin 宽和最大距离。',[
        command('计算 RDF','gmx rdf -f md.xtc -s md.tpr -n index.ndx -o rdf.xvg -cn rdf_cn.xvg -bin 0.005 -rmax 1')],'rdf.xvg 和 rdf_cn.xvg。','rmax/距离单位为 nm；分析时间段需处于平衡后的生产段。')
    ],['来源示例参数不是通用值；更改组定义或时间窗口会改变物理解释。'],'分析任务 / Analysis'),

  flow('gmx-msd','GROMACS','轨迹分析','GROMACS：MSD 与扩散系数','GROMACS: MSD and diffusion',
    '选择离子/分子组、正确处理 PBC 和漂移，计算 MSD 并拟合扩散线性区。',
    'Select the target group, handle PBC/drift, calculate MSD, and fit the diffusive linear regime.',
    '从 MSD 斜率得到扩散系数并报告拟合窗口和统计误差。',
    ['足够长的生产轨迹 md.xtc','对应 md.tpr 与 index.ndx','平衡与采样分析方案'],[
      step('定义目标物种组','Define target species group','为离子或分子创建索引组。',[
        command('交互创建索引文件','gmx make_ndx -f md.tpr -o index.ndx')],'含目标组的 index.ndx。','明确是计算原子 MSD 还是分子质心 MSD。'),
      step('计算均方位移曲线','Calculate the MSD curve','用相匹配的 TPR 和轨迹产生 MSD 时间序列。',[
        command('运行 gmx msd','gmx msd -f md.xtc -s md.tpr -n index.ndx -o msd.xvg')],'msd.xvg。','确认周期边界展开、去整体漂移和分析时间窗口设置正确。'),
      step('拟合扩散区间并报告','Fit diffusion regime and report','在三维长时扩散区用 MSD=6Dt 计算扩散系数。',[
        command('三维扩散关系','D = slope(MSD versus time) / 6')],'带单位的扩散系数。','避开短时弹道区和长时噪声区；用独立轨迹或 block averaging 估算误差。')
    ],['短轨迹/单条轨迹通常不足以提供可靠扩散系数。'],'分析任务 / Analysis'),

  flow('gmx-hbond','GROMACS','轨迹分析','GROMACS：氢键统计','GROMACS: hydrogen-bond analysis',
    '从生产轨迹统计目标分子组之间的氢键数量，并核对识别判据。',
    'Count hydrogen bonds between selected groups and verify the geometric criteria.',
    '得到氢键时间序列或平均占有率。',
    ['md.xtc 和对应 md.tpr','明确的 donor/acceptor 组','正确的氢原子拓扑/命名'],[
      step('运行氢键分析','Run hydrogen-bond analysis','选择供体/受体组，生成数量时间序列和氢键索引。',[
        command('计算氢键数量','gmx hbond -s md.tpr -f md.xtc -num hbnum.xvg -hbn hbond.ndx')],'hbnum.xvg 和 hbond.ndx。','交互选择目标组；检查本机 GROMACS 版本的角度/距离判据和命令语法。')
    ],['版本升级会改变命令入口或选项；先运行 gmx hbond -h。'],'分析任务 / Analysis'),

  flow('gmx-observables','GROMACS','轨迹分析','GROMACS：最小距离、密度和结构帧','GROMACS: distances, density, and trajectory frames',
    '把距离统计、能量提取和结构帧导出作为三个不同分析任务，分别解释输入和输出。',
    'Treat distance statistics, energy extraction, and frame export as separate analyses with distinct outputs.',
    '从轨迹回答指定的接触、热力学和结构问题。',
    ['md.xtc、md.tpr、md.edr','index.ndx（按需）','目标时间点和距离阈值'],[
      step('统计原子组最小距离','Calculate minimum group distance','输出两个组之间的最近距离和距离阈值内的接触数。',[
        command('运行 mindist','gmx mindist -f md.xtc -s md.tpr -n index.ndx -od dist.xvg -on num.xvg -d 0.1918')],'dist.xvg 和 num.xvg。','阈值单位 nm；0.1918 nm=1.918 Å，只是原文个案。'),
      step('从能量文件导出密度/能量项','Extract density or energy terms','从 EDR 交互选择目标热力学观测量并导出。',[
        command('打开能量选择菜单','gmx energy -f md.edr -o observable.xvg')],'observable.xvg。','确认选中的量、单位和时间范围；文件中没有的观测量无法事后恢复。'),
      step('提取指定时间的结构帧','Extract a frame at a chosen time','从轨迹在指定 ps 提取快照，再选择 PBC 处理。',[
        command('提取 20 ns 帧（时间单位 ps）','gmx trjconv -f md.xtc -s md.tpr -o frame.pdb -dump 20000')],'frame.pdb。','替换为实际轨迹时长内的时间；按需先处理 whole/nojump/center。')
    ],['距离阈值、能量项和 PBC 方案都应按研究问题选择。'],'分析任务 / Analysis'),

  flow('gmx-install','GROMACS','安装','GROMACS：源码编译与验证','GROMACS: build and verify from source',
    '准备兼容工具链，在独立目录配置 CMake、编译、安装并确认 GPU/版本能力。',
    'Prepare a compatible toolchain, configure CMake, build, install, and verify supported features.',
    '在目标集群安装与编译器、MPI、CUDA 和 FFTW 相容的 GROMACS。',
    ['GROMACS 官方源码','CMake、编译器和可选 CUDA toolkit','用户可写安装目录'],[
      step('载入工具链并记录版本','Load toolchain and record versions','按集群说明载入编译器、MPI 和 CUDA，不混合冲突模块。',[
        command('查看可用模块','module avail'),
        command('查看当前模块','module list'),
        command('检查 CUDA 编译器','nvcc --version')],'已记录的编译器/MPI/CUDA 环境。','原文版本和路径是个人配置；先询问集群管理员支持组合。'),
      step('创建独立构建目录','Create build directory','在源码树内将构建文件与源码分开。',[
        command('创建并进入 build','mkdir -p build\\ncd build')],'build/ 目录。','每一种 GPU/CPU 配置使用独立 build 目录。'),
      step('配置 CMake','Configure with CMake','启用需要的 FFTW/GPU 选项并指定安装前缀。',[
        command('配置 CUDA 示例','cmake .. -DGMX_BUILD_OWN_FFTW=ON -DGMX_GPU=CUDA -DCMAKE_INSTALL_PREFIX=\"$HOME/software/gromacs\"')],'CMakeCache.txt 和配置摘要。','GMX_GPU 选项取决于 GROMACS 版本；查看配置输出确认 CUDA 被检测。'),
      step('编译、安装和验证','Build, install, and verify','使用适合节点的并行度构建，确认安装的 gmx 指向目标版本。',[
        command('编译和安装','cmake --build . -j 8\\ncmake --install .'),
        command('查看安装版本和 GPU 支持','\"$HOME/software/gromacs/bin/gmx\" --version')],'安装好的 gmx 和版本/功能信息。','运行小型 grompp 与短模拟验证；失败先看首个编译/链接错误。')
    ],['原始案例针对 GROMACS 2023.5；编译选项和 GPU 后端随版本变化。'],'管理员流程 / Build'),

  flow('vasp-neb-missing','VASP','待补全计算','VASP：SOC / Meta-GGA 输入补全清单','VASP: SOC / Meta-GGA information needed',
    '现有 SOC 文档只有外链、Meta-GGA 文档只有标题；这里列出补成可复现教程所需信息。',
    'The available SOC note is only a link and the Meta-GGA note only a title; this checklist identifies missing information.',
    '在发布可执行输入模板前，补齐方法版本、对照计算、收敛测试和验证结果。',
    ['VASP 版本和具体泛函/功能','完整 INCAR/KPOINTS/POSCAR','小体系对照计算与预期输出'],[
      step('确认当前 VASP 版本和官方方法说明','Confirm VASP version and method documentation','记录版本、编译功能和所选方法的官方参考。',[
        command('按管理员环境确认二进制','which vasp_std')],'VASP 可执行文件路径。','此页不提供未验证的 SOC 或 Meta-GGA 标签块。'),
      step('补充完整输入和对照算例','Add complete inputs and a reference case','记录初始磁矩、对称性、非共线/SOC、泛函参数和赝势版本。',[
        command('为新案例保存输入清单','INCAR  +  POSCAR  +  KPOINTS  +  POTCAR version')],'可复现的最小案例。','原始文档信息不足，参数需由作者和 VASP 版本手册确认。'),
      step('进行收敛测试和结果比对','Run convergence and comparison checks','记录 ENCUT、k 网格、带数、磁矩和能量对照。',[
        command('为每个测试归档输入哈希','sha256sum INCAR POSCAR KPOINTS')],'参数敏感性表及输入来源。','完成后再把此页扩写为可运行工作流。')
    ],['本页面是补资料清单，不是 SOC/Meta-GGA 操作教程。'],'待补充 / Incomplete')
];

