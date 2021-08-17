const EulerStakingContract = artifacts.require("EulerStaking");

contract('EulerStaking', (accounts) => {
  it('Should deploy smart contract properly', async () => {
    const eulerStakingContract = await EulerStakingContract.deployed();
    console.log("Contract Address is: ", eulerStakingContract.address);
    assert(eulerStakingContract.address !== '');
  })

  it('Should allow to set a token as default', async () => {
    const result = await EulerStakingContract.deployed().then(async (instance)=> {
      return instance.setEulerToken('0x3920123482070c1a2dff73aad695c60e7c6f6862')
    })
    const token = await instance.renderHelloWorld().call()
    console.log(token)
  })
})
