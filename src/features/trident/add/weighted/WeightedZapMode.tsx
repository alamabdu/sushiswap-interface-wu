import Alert from '../../../../components/Alert'
import { t } from '@lingui/macro'
import Button from '../../../../components/Button'
import { useLingui } from '@lingui/react'
import Typography from '../../../../components/Typography'
import ListPanel from '../../../../components/ListPanel'
import AssetInput from '../../../../components/AssetInput'
import { NATIVE } from '@sushiswap/core-sdk'
import TransactionDetails from './../TransactionDetails'
import React from 'react'
import { useActiveWeb3React, useBentoBoxContract } from '../../../../hooks'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { attemptingTxnAtom, noLiquiditySelector, showReviewAtom } from '../../context/atoms'
import { useCurrencyBalance } from '../../../../state/wallet/hooks'
import { ConstantProductPoolState } from '../../../../hooks/useTridentClassicPools'
import TridentApproveGate from '../../ApproveButton'
import Lottie from 'lottie-react'
import loadingCircle from '../../../../animation/loading-circle.json'
import Dots from '../../../../components/Dots'
import {
  parsedZapAmountSelector,
  parsedZapSplitAmountsSelector,
  poolAtom,
  selectedZapCurrencyAtom,
  zapInputAtom,
} from './context/atoms'

const WeightedZapMode = () => {
  const { account, chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const bentoBox = useBentoBoxContract()

  const [poolState, pool] = useRecoilValue(poolAtom)
  const [zapInput, setZapInput] = useRecoilState(zapInputAtom)
  const parsedZapAmount = useRecoilValue(parsedZapAmountSelector)
  const parsedZapSplitAmounts = useRecoilValue(parsedZapSplitAmountsSelector)
  const [selectedZapCurrency, setSelectedZapCurrency] = useRecoilState(selectedZapCurrencyAtom)
  const setShowReview = useSetRecoilState(showReviewAtom)
  const balance = useCurrencyBalance(account ?? undefined, selectedZapCurrency)
  const noLiquidity = useRecoilValue(noLiquiditySelector)
  const attemptingTxn = useRecoilValue(attemptingTxnAtom)

  let error = !account
    ? i18n._(t`Connect Wallet`)
    : poolState === ConstantProductPoolState.INVALID
    ? i18n._(t`Invalid pair`)
    : !zapInput
    ? i18n._(t`Enter an amount`)
    : parsedZapAmount && balance?.lessThan(parsedZapAmount)
    ? i18n._(t`Insufficient ${selectedZapCurrency?.symbol} balance`)
    : ''

  return (
    <>
      {noLiquidity ? (
        <div className="px-5 pt-5">
          <Alert
            dismissable={false}
            type="error"
            showIcon
            message={i18n._(t`Zap mode is unavailable when there is no liquidity in the pool`)}
          />
        </div>
      ) : (
        <div className="px-5 pt-5">
          <Alert
            dismissable={false}
            type="information"
            showIcon
            message={i18n._(t`In Zap mode, your selected asset will be split and rebalanced into the corresponding tokens and their weights
          automatically.`)}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 px-5">
        <AssetInput
          value={zapInput}
          currency={selectedZapCurrency}
          onChange={setZapInput}
          onSelect={setSelectedZapCurrency}
          disabled={noLiquidity}
          currencies={[NATIVE[chainId], pool?.token0, pool?.token1]}
        />
        <div className="flex flex-col gap-3">
          <TridentApproveGate inputAmounts={[parsedZapAmount]} tokenApproveOn={bentoBox?.address}>
            {({ loading, approved }) => (
              <Button
                {...(loading && {
                  startIcon: (
                    <div className="w-5 h-5 mr-1">
                      <Lottie animationData={loadingCircle} autoplay loop />
                    </div>
                  ),
                })}
                color={zapInput ? 'gradient' : 'gray'}
                disabled={!!error || !approved || attemptingTxn}
                className="font-bold text-sm"
                onClick={() => setShowReview(true)}
              >
                {attemptingTxn ? <Dots>Depositing</Dots> : loading ? '' : !error ? i18n._(t`Confirm Deposit`) : error}
              </Button>
            )}
          </TridentApproveGate>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-5 mt-8">
        <Typography weight={700} className="text-high-emphesis">
          {selectedZapCurrency
            ? i18n._(t`Your ${selectedZapCurrency.symbol} will be split into:`)
            : i18n._(t`Your selected token will be split into:`)}
        </Typography>
        <ListPanel
          items={parsedZapSplitAmounts.map((amount, index) => (
            <ListPanel.CurrencyAmountItem amount={amount} key={index} />
          ))}
        />
      </div>
      {!error && (
        <div className="mt-6 px-5">
          <TransactionDetails />
        </div>
      )}
    </>
  )
}

export default WeightedZapMode
