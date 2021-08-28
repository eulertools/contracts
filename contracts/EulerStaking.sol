//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0 <=0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EulerStaking is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  struct UserInfo {
    uint256 amount;
    uint256 rewardDebt;
    uint256 pendingRewards;
    uint256 lastClaim;
  }

  struct GetUserInfo {
    uint256 amount;
    uint256 pendingRewards;
    uint256 withdrawAvaliable;
    uint256 eulerPerBlock;
    uint256 tvl;
  }

  struct PoolInfo {
    uint256 allocPoint;
    uint256 lastRewardBlock;
    uint256 accEulerPerShare;
    uint256 depositedAmount;
    uint256 rewardsAmount;
    uint256 lockupDuration;
  }

  IERC20 public euler;
  uint256 public eulerTxFee = 100;
  uint256 public maxFee = 10000;
  uint256 public eulerPerBlock = uint256(1 ether);
  uint256 public minDepositAmount = 0;
  uint256 public maxDepositAmount = type(uint256).max;

  PoolInfo[] public poolInfo;
  mapping(uint256 => mapping(address => UserInfo)) public userInfo;
  uint256 public totalAllocPoint = 10;

  event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
  event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
  event Claim(address indexed user, uint256 indexed pid, uint256 amount);

  function addPool(uint256 _allocPoint, uint256 _lockupDuration) internal {
    poolInfo.push(
      PoolInfo({
        allocPoint: _allocPoint,
        lastRewardBlock: 0,
        accEulerPerShare: 0,
        depositedAmount: 0,
        rewardsAmount: 0,
        lockupDuration: _lockupDuration
      })
    );
  }

  function setEulerToken(IERC20 _euler) external onlyOwner {
    require(address(euler) == address(0), "Token already set!");
    euler = _euler;
    addPool(10, 30 days);
  }

  function startStaking(uint256 startBlock) external onlyOwner {
    require(poolInfo[0].lastRewardBlock == 0, "Staking already started");
    poolInfo[0].lastRewardBlock = startBlock;
  }

  function setLockupDuration(uint256 _lockupDuration, uint256 pid)
    external
    onlyOwner
  {
    PoolInfo storage pool = poolInfo[pid];
    pool.lockupDuration = _lockupDuration;
  }

  function pendingRewards(uint256 pid, address _user) private view
    returns (uint256)
  {
    require(
      poolInfo[pid].lastRewardBlock > 0 &&
        block.number >= poolInfo[pid].lastRewardBlock,
      "Staking not yet started"
    );
    PoolInfo storage pool = poolInfo[pid];
    UserInfo storage user = userInfo[pid][_user];
    uint256 accEulerPerShare = pool.accEulerPerShare;
    uint256 depositedAmount = pool.depositedAmount;
    if (block.number > pool.lastRewardBlock && depositedAmount != 0) {
      uint256 multiplier = block.number.sub(pool.lastRewardBlock);
      uint256 eulerReward = multiplier
      .mul(eulerPerBlock)
      .mul(pool.allocPoint)
      .div(totalAllocPoint);
      accEulerPerShare = accEulerPerShare.add(
        eulerReward.mul(1e12).div(depositedAmount)
      );
    }
    return
      user.amount.mul(accEulerPerShare).div(1e12).sub(user.rewardDebt).add(
        user.pendingRewards
      );
  }

  function getUserInfo(uint256 pid, address _user)
    external
    view
    returns (GetUserInfo memory) {

        PoolInfo storage pool = poolInfo[pid];

        UserInfo storage user = userInfo[pid][_user];

        GetUserInfo memory userAux;

        userAux.amount = user.amount;

        userAux.withdrawAvaliable = 0;

        if(user.lastClaim > 0) {

            userAux.withdrawAvaliable = user.lastClaim + pool.lockupDuration;
        }

        userAux.eulerPerBlock = eulerPerBlock;

        userAux.tvl = pool.depositedAmount;

        userAux.pendingRewards = pendingRewards(pid,_user);

        return userAux;
  }

  function updatePool(uint256 pid) internal {
    require(
      poolInfo[pid].lastRewardBlock > 0 &&
        block.number >= poolInfo[pid].lastRewardBlock,
      "Staking not yet started"
    );
    PoolInfo storage pool = poolInfo[pid];
    if (block.number <= pool.lastRewardBlock) {
      return;
    }
    uint256 depositedAmount = pool.depositedAmount;
    if (pool.depositedAmount == 0) {
      pool.lastRewardBlock = block.number;
      return;
    }
    uint256 multiplier = block.number.sub(pool.lastRewardBlock);
    uint256 eulerReward = multiplier
    .mul(eulerPerBlock)
    .mul(pool.allocPoint)
    .div(totalAllocPoint);
    pool.rewardsAmount = pool.rewardsAmount.add(eulerReward);
    pool.accEulerPerShare = pool.accEulerPerShare.add(
      eulerReward.mul(1e12).div(depositedAmount)
    );
    pool.lastRewardBlock = block.number;
  }

  function deposit(uint256 pid, uint256 amount) external {

    PoolInfo storage pool = poolInfo[pid];
    UserInfo storage user = userInfo[pid][msg.sender];

    uint256 sumAmount = amount + user.amount;

    require(
      sumAmount >= minDepositAmount && sumAmount < maxDepositAmount,
      "invalid deposit amount"
    );

    updatePool(pid);
    if (user.amount > 0) {
      uint256 pending = user.amount.mul(pool.accEulerPerShare).div(1e12).sub(
        user.rewardDebt
      );
      if (pending > 0) {
        user.pendingRewards = user.pendingRewards.add(pending);
      }
    }
    if (amount > 0) {
      euler.safeTransferFrom(address(msg.sender), address(this), amount);
      // Lost 1% fee from transaction
      amount = amount.sub(amount.mul(eulerTxFee).div(maxFee));
      user.amount = user.amount.add(amount);
      pool.depositedAmount = pool.depositedAmount.add(amount);
    }
    user.rewardDebt = user.amount.mul(pool.accEulerPerShare).div(1e12);
    user.lastClaim = block.timestamp;
    emit Deposit(msg.sender, pid, amount);
  }

  function withdraw(uint256 pid, uint256 amount) public {
    PoolInfo storage pool = poolInfo[pid];
    UserInfo storage user = userInfo[pid][msg.sender];
    require(
      block.timestamp > user.lastClaim + pool.lockupDuration,
      "You cannot withdraw yet!"
    );
    require(user.amount >= amount, "Withdrawing more than you have!");
    updatePool(pid);
    uint256 pending = user.amount.mul(pool.accEulerPerShare).div(1e12).sub(
      user.rewardDebt
    );
    if (pending > 0) {
      user.pendingRewards = user.pendingRewards.add(pending);
    }
    if (amount > 0) {
      euler.safeTransfer(address(msg.sender), amount);
      user.amount = user.amount.sub(amount);
      pool.depositedAmount = pool.depositedAmount.sub(amount);
    }
    user.rewardDebt = user.amount.mul(pool.accEulerPerShare).div(1e12);
    user.lastClaim = block.timestamp;
    emit Withdraw(msg.sender, pid, amount);
  }

  function withdrawAll(uint256 pid) external {
    UserInfo storage user = userInfo[pid][msg.sender];

    withdraw(pid, user.amount);
  }

  function claim(uint256 pid) public {
    PoolInfo storage pool = poolInfo[pid];
    UserInfo storage user = userInfo[pid][msg.sender];
    updatePool(pid);
    uint256 pending = user.amount.mul(pool.accEulerPerShare).div(1e12).sub(
      user.rewardDebt
    );
    if (pending > 0 || user.pendingRewards > 0) {
      user.pendingRewards = user.pendingRewards.add(pending);
      uint256 claimedAmount = safeEulerTransfer(
        msg.sender,
        user.pendingRewards,
        pid
      );
      emit Claim(msg.sender, pid, claimedAmount);
      user.pendingRewards = user.pendingRewards.sub(claimedAmount);
      user.lastClaim = block.timestamp;
      pool.rewardsAmount = pool.rewardsAmount.sub(claimedAmount);
    }
    user.rewardDebt = user.amount.mul(pool.accEulerPerShare).div(1e12);
  }

  function safeEulerTransfer(
    address to,
    uint256 amount,
    uint256 pid
  ) internal returns (uint256) {
    PoolInfo memory pool = poolInfo[pid];
    uint256 _bal = euler.balanceOf(address(this));
    if (amount > pool.rewardsAmount) amount = pool.rewardsAmount;
    if (amount > _bal) amount = _bal;
    euler.safeTransfer(to, amount);
    return amount;
  }

  function setEulerPerBlock(uint256 _eulerPerBlock) external onlyOwner {
    require(_eulerPerBlock > 0, "EULER per block should be greater than 0!");
    eulerPerBlock = _eulerPerBlock;
  }

  function setMinDepositAmount(uint256 _amount) external onlyOwner {
    require(_amount > 0, "invalid value");
    minDepositAmount = _amount;
  }

  function setMaxDepositAmount(uint256 _amount) external onlyOwner {
    require(
      _amount > minDepositAmount,
      "invalid value, should be greater than mininum amount"
    );
    maxDepositAmount = _amount;
  }

  function setEulerTxFee(uint256 _fee) external onlyOwner {
    require(_fee < 10000, "invalid fee");

    eulerTxFee = _fee;
  }
}
