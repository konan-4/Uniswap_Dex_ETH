import { Container } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import * as React from 'react';
import PropTypes from 'prop-types';
import { BigNumber, ethers, providers, utils} from 'ethers';
import {useWalletClient, useAccount} from 'wagmi';
import {useState, useEffect} from 'react'
import { revert } from 'viem/actions';
import IUniswapV2Factory from '@uniswap/v2-core/build/IUniswapV2Factory.json'
import IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import IET1 from './ET1.json'
import IWETH from './WETH.json'
import { useEthersProvider, useEthersSigner } from './ethers'
import liquidityABI from './liquidity.json';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import SwapVertIcon from '@mui/icons-material/SwapVert';

function CustomTabPanel(props) {
    const { children, value, index, setTotalLiquidity, ...other } = props;
    return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
        >
          {value === index && <Box sx={{ p: 3 }} onClick={setTotalLiquidity}>{children}</Box>}
        </div>
      );
}

CustomTabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };
function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

const DexComponent = () => {
        // const provider = useProvider();
        const [value, setValue] = useState(0);
        const [token1Amount, set1Amount] = useState('0')
        const [token2Amount, set2Amount] = useState('0')
        const routerAddress = '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008'; //Uniswap v2 Router contract address
        const factoryAddress = '0x7E0987E5b3a30e3f2828572Bb659A548460a3003'; // Uniswap V2 Factory contract address

        const token1Address = '0x8eE0f3AF39eb852ccC2d41E12B9e5D55D529d095'; // ET1 token address
        const token2Address = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'; // WETH token address
        //0x2874fb93c9267348975344e61A5dBFa7a43C1E13    .....LP token address
        const {data: walletClient} = useWalletClient()
        const [liquidity, setLiquidity] = useState('0')
        const {address, isConnecting, isDisconnected}  = useAccount()
        const [amountETH, setRemovedETH] = useState('0')
        const [amountToken, setRemovedToken] = useState('0')
        const [totalLiquidity, setTotalLiquidity] = useState('0')
        
        const [tokenAmount, setTokenAmount] = useState('0');
        const [wethAmount, setWethAmount] = useState('0');
        const [addedLiquidity, setAddLiquidity] = useState('0')
        const [beforeLiquidity, setBeforeLiquidity] = useState('0')
        const [reserveIn, setReserveIn] = useState('0')
        const [reserveOut, setReserveOut]  = useState('0')
        const [reserve, setReserve] = useState('0')
        const provider = useEthersProvider()
        const signer = useEthersSigner()
        const [isWethtoToken, setWethtoSwap] = useState(true)
        

        async function createPair() {
          
          try {
            const factoryContract = new ethers.Contract(factoryAddress, IUniswapV2Factory.abi, signer)
            
            console.log('Pair is creating:', factoryContract);
            const pairAddress = await factoryContract.createPair(token1Address, token2Address)

            console.log('Pair is creating: successful', pairAddress);
            console.log('addressLP is created !!!....', pairAddress);
          } catch (error) {
            console.error('Error creating pair:', error);
          }
        }

        async function addLiquidity() {
          
          try {
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
            console.log('New liquidity adding....', token1Amount, token2Amount, address);

            const routerContract = new ethers.Contract(routerAddress, IUniswapV2Router02.abi, signer)
            
            const amountToken1 = ethers.utils.parseEther(token1Amount, "ether")
            const value = ethers.utils.parseEther(token2Amount, "ether")
            const tx_addLiquidity = await routerContract.addLiquidityETH(token1Address, amountToken1, 0 , 0 , address, deadline, {value: value})//when first addLiquidity add argument {, {value : "1"}}
            if (tx_addLiquidity)
              await tx_addLiquidity.wait()

            
            const factoryContract = new ethers.Contract(factoryAddress, IUniswapV2Factory.abi, signer)
            const pairAddress = await factoryContract.getPair(token1Address, token2Address)
            const contractLiquidity = new ethers.Contract(pairAddress, liquidityABI, provider)
            console.error('New liquidity :', provider);
            const totalLiq = await contractLiquidity.balanceOf(address)
            setTotalLiquidity(ethers.utils.formatUnits(totalLiq, 'ether'))
            console.log('totalLiquidity is loaded : ' + ethers.utils.formatUnits(totalLiq, 'ether'))
            // handleReserve()
          } catch (error) {
            console.error('Error adding liquidity:', error);
          }
        }
        const setTotalLiquidityAmount = async () => {
          try {
            console.log('setTotalLiquidityAmount loading1...')
            const contractLiquidity = new ethers.Contract('0x2874fb93c9267348975344e61A5dBFa7a43C1E13', liquidityABI, provider)
            console.log('setTotalLiquidityAmount loading4...',contractLiquidity)
            const totalLiq = await contractLiquidity.balanceOf(address)
            console.log('setTotalLiquidityAmount loading5...',totalLiq)
            setTotalLiquidity(ethers.utils.formatUnits(totalLiq, 'ether'))}
            catch(error){console.log('error while fetching total liquidity', error)}
        }

        useEffect(() => {
        },[])

        async function removeLiquidity() {
          
          try { // before removeLiquidity, approve from owner's LP to router
            if (liquidity >= 1)

           { const factoryContract = new ethers.Contract(factoryAddress, IUniswapV2Factory.abi, signer)
            const pairAddress = await factoryContract.getPair(token1Address, token2Address)
            const contractLiquidity = new ethers.Contract(pairAddress, liquidityABI, signer)
            const approve = await contractLiquidity.approve(routerAddress, ethers.utils.parseUnits(totalLiquidity, 'ether'))
            await approve.wait()
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
            const removeliq = totalLiquidity * (liquidity / 100)
            console.log('liquidity is removing....  ' + ethers.utils.parseEther(String(removeliq)));// remove percentage TotalLiquidity
            
            const routerContract = new ethers.Contract(routerAddress, IUniswapV2Router02.abi, signer)
            await routerContract.removeLiquidityETH(token1Address, ethers.utils.parseEther(String(removeliq)), 0 , 0 , address, deadline)    // remove percentage TotalLiquidity

            console.log('liquidity removed !!!....', removeliq);}
            else
            window.alert('input percentage number greater than 1')
          } catch (error) {
            console.error('Error remove liquidity:', error);
          }
        }
        const handleChange = (event, newValue) => {
          setValue(newValue);
        };
        async function handleSwapFromTokenToETH() {
          try {
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
            const routerContract = new ethers.Contract(routerAddress, IUniswapV2Router02.abi, signer)
            console.log('swapping TokenAmount : ',tokenAmount)
            const amountETH = await routerContract.swapExactTokensForETH(ethers.utils.parseUnits(tokenAmount, 'ether'), 0, [token1Address, token2Address], address, deadline)
            console.log('Swapped amountETH : ' + amountETH[0])
            // handleReserve()
            handlePoolAmount()
          } catch (error) {
            console.error('Error swap ETH:', error);
          }
        }
        async function handleSwapFromETHToToken() {
          try {
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
            const routerContract = new ethers.Contract(routerAddress, IUniswapV2Router02.abi, signer)
            console.log('swapping ETHAmount : ', wethAmount)
            const value = ethers.utils.parseUnits(String(Number(wethAmount)), 'ether')
            console.log('swapping value : ', value)
            const amountToken = await routerContract.swapETHForExactTokens(ethers.utils.parseUnits(tokenAmount, 'ether'), [token2Address, token1Address], address, deadline, {value: value})
            console.log('Swapped amountToken : ' + amountToken[1])
            // handleReserve()
            handlePoolAmount()
          } catch (error) {
            console.error('Error swap TOKEN:', error);
          }
        }
        const handleWethAmount = async (e) => {
          try{
            setTokenAmount(e)
            if (e === '' || Number(e) <= 0) {setWethAmount('0'); return}
            const routerContract = new ethers.Contract(routerAddress, IUniswapV2Router02.abi, signer)
            if (isWethtoToken){
              const amountsIn = await routerContract.getAmountsIn(
                ethers.utils.parseUnits(e, 'ether'), // Input amount in wei
                [token2Address, token1Address] // Array of token addresses
              );
              setWethAmount(ethers.utils.formatUnits(amountsIn[0], 'ether'));
            }else{
              const amountsOut = await routerContract.getAmountsOut(
                ethers.utils.parseUnits(e, 'ether'), // Input amount in wei
                [token1Address, token2Address] // Array of token addresses
              );
              setWethAmount(ethers.utils.formatUnits(amountsOut[1], 'ether'));
            }
          }
          catch(e)
          {
            console.log(e)
          }
          
        }
        const handleTokenAmount = async (e) => {
          try{
          setWethAmount(e)
          if (e === '' || Number(e) <= 0) {setTokenAmount('0'); return}
          const routerContract = new ethers.Contract(routerAddress, IUniswapV2Router02.abi, signer)
          if (isWethtoToken)
          {
            const amountsOut = await routerContract.getAmountsOut(
            ethers.utils.parseUnits(e, 'ether'), // Input amount in wei
            [token2Address,token1Address] // Array of token addresses
            );
            setTokenAmount(ethers.utils.formatUnits(amountsOut[1], 'ether'));
          }
          else{
            const amountsIn = await routerContract.getAmountsIn(
              ethers.utils.parseUnits(e, 'ether'), // Input amount in wei
              [token1Address,token2Address] // Array of token addresses
            );
            setTokenAmount(ethers.utils.formatUnits(amountsIn[0], 'ether'));
          }
          }
          catch(e){
            console.log(e)
          }
        }
        const handleReserve = async () => {
           try{
            const factoryContract = new ethers.Contract(factoryAddress, IUniswapV2Factory.abi, signer)
            const pairAddress = await factoryContract.getPair(token1Address, token2Address)
            const contractLiquidity = new ethers.Contract(pairAddress, liquidityABI, provider)
            const [reserveIn, reserveOut, blockTimeStampLast] = await contractLiquidity.getReserves()
            console.log('reserve : ', Number(reserveIn), Number(reserveOut))
            setReserveIn(Number(reserveIn))
            setReserveOut(Number(reserveOut))
            setReserve(reserveIn + '    /    ' + reserveOut)
          }
          catch(e){
            console.log(e)
          }
        }
        const handlePoolAmount = async () => {
          try{
            const factoryContract = new ethers.Contract(factoryAddress, IUniswapV2Factory.abi, signer)
            const pairAddress = await factoryContract.getPair(token1Address, token2Address)
            const tokenContract = new ethers.Contract(token1Address, IET1, provider)
            const WETHContract = new ethers.Contract(token2Address, IWETH, provider)
            const reserveIn = await tokenContract.balanceOf(pairAddress)
            const reserveOut = await WETHContract.balanceOf(pairAddress)
            setReserveIn(ethers.utils.formatUnits(reserveIn, 'ether'))
            console.log('reserveIn : ' + ethers.utils.formatUnits(reserveIn, 'ether'))
            setReserveOut(ethers.utils.formatUnits(reserveOut, 'ether'))
            console.log('reserveOut : ' + ethers.utils.formatUnits(reserveOut, 'ether'))
          }
          catch(e){
            console.log(e)
          }
        }

      

        return (
        <>
            <div style={{height:'50px'}}></div>
            <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Create Pair" {...a11yProps(0)} />
                <Tab label="Add Liquidity" {...a11yProps(1)} />
                <Tab label="Remove Liquidity" {...a11yProps(2)} onClick={() => {setTotalLiquidityAmount()}}/>
                <Tab label="Swap" {...a11yProps(3)} onClick={() => {handlePoolAmount()}}/>
            </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <Button variant="contained" onClick={createPair}>Create Pair</Button>
                <div style={{height:'50px'}}></div>
                <TextField label="Token Address" defaultValue={token1Address} fullWidth/>
                <br></br>
                <br></br>
                <TextField label="WETH Address" disabled value={token2Address} fullWidth />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
            <Button variant="contained" onClick={addLiquidity}>Add Liquidity</Button>
                <div style={{height:'50px'}}></div>
                <TextField label="Token Amount" type='number' value={token1Amount} fullWidth onChange={(e)=> {set1Amount((e.target.value))} }/>
                <br></br>
                <br></br>
                <TextField label="WETH Amount" type='number' value={token2Amount} fullWidth onChange={(e)=> {set2Amount(e.target.value)}} />
                <br></br>
                <br></br>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2} setTotalLiquidity = {setTotalLiquidityAmount} onClick={() => {console.log('tab clicked!')}}>
              <Button variant="contained" onClick={removeLiquidity}>Remove Liquidity</Button>
                <br></br>
                <br></br>
                <TextField label="Total Liquidity Amount" disabled value={totalLiquidity} fullWidth onChange={(e) => {setTotalLiquidity(e.target.value)}}/>
                  <br></br>
                  <br></br>
              <TextField label="Liquidity Percentage" type='number' value={liquidity} fullWidth onChange={(e)=> {if (Number(e.target.value) >= 0 && Number(e.target.value) <= 100) setLiquidity(e.target.value)}} />
              <br></br>
              <br></br>

            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <TextField
                  label="Pool Amount"
                  value={reserveIn + ' / ' + reserveOut}
                  fullWidth
                  margin="normal"
                  disabled
                />
                <Stack spacing={2} direction="row" justifyContent="center" alignItems="center">
                  {isWethtoToken? <Button variant="contained" color="primary" onClick={handleSwapFromETHToToken}>Swap</Button> :
                  <Button variant="contained" color="primary" onClick={handleSwapFromTokenToETH}>Swap</Button>}
                </Stack>
                <TextField
                  label={isWethtoToken? ("WETH : " + token2Address):("Token : " + token1Address)}
                  value={isWethtoToken? wethAmount : tokenAmount}
                  type='number'
                  onChange={(e) => {isWethtoToken? handleTokenAmount(e.target.value) : handleWethAmount(e.target.value)}}
                  fullWidth
                  margin="normal"
                />
                <IconButton variant="contained" color="primary" onClick={() => {setWethtoSwap(!isWethtoToken)}}>
                  <SwapVertIcon />
                </IconButton>
                <TextField
                  label={isWethtoToken? ("Token : " + token1Address):("WETH : " + token2Address)}
                  value={isWethtoToken? tokenAmount: wethAmount}
                  type='number'
                  onChange={(e) => {isWethtoToken? handleWethAmount(e.target.value) : handleTokenAmount(e.target.value)}}
                  fullWidth
                  margin="normal"
                />
            </CustomTabPanel>
            </Box>
        </>
    );

}

export default DexComponent