import React, { FC, useCallback } from 'react'
import Typography from '../../../components/Typography'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { useTridentRemoveLiquidityPageContext, useTridentRemoveLiquidityPageState } from './context'
import ListPanel from '../../../components/ListPanel'
import NumericalInput from '../../../components/NumericalInput'
import Button from '../../../components/Button'
import ToggleButtonGroup from '../../../components/ToggleButton'
import { ActionType } from '../add/context/types'
import { useUSDCValue } from '../../../hooks/useUSDCPrice'

const ClassicUnzapMode: FC = () => {
  const { i18n } = useLingui()
  const { percentageAmount, outputTokenAddress } = useTridentRemoveLiquidityPageState()
  const { pool, dispatch, handlePercentageAmount, parsedInputAmounts, parsedOutputAmounts } =
    useTridentRemoveLiquidityPageContext()

  // TODO this value is incorrect
  const usdcValue = useUSDCValue(parsedInputAmounts[outputTokenAddress])

  const handleClick = useCallback(() => {
    dispatch({
      type: ActionType.SHOW_ZAP_REVIEW,
      payload: true,
    })
  }, [dispatch])

  return (
    <div className="px-5 mt-5">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 mt-4">
          <Typography variant="h3" weight={700} className="text-high-emphesis">
            Amount to Remove:
          </Typography>
          <ListPanel
            header={<ListPanel.Header title={i18n._(t`Balances`)} value="$16,720.00" subValue="54.32134 SLP" />}
            items={pool.tokens.map((token, index) => (
              <ListPanel.CurrencyAmountItem amount={parsedInputAmounts[token.address]} key={index} />
            ))}
            footer={
              <div className="flex justify-between items-center px-4 py-5 gap-3">
                <NumericalInput
                  value={percentageAmount}
                  onUserInput={(value: string) => handlePercentageAmount(value)}
                  placeholder="0%"
                  className="bg-transparent text-3xl leading-7 tracking-[-0.01em] flex-grow after:content-['%']"
                  max={100}
                  min={0}
                />
                <Typography variant="sm" className="text-low-emphesis">
                  ≈${usdcValue?.greaterThan('0') ? usdcValue?.toSignificant(6) : '0.0000'}
                </Typography>
              </div>
            }
          />
          <ToggleButtonGroup value={percentageAmount} onChange={(value: string) => handlePercentageAmount(value)}>
            <ToggleButtonGroup.Button value="100">Max</ToggleButtonGroup.Button>
            <ToggleButtonGroup.Button value="75">75%</ToggleButtonGroup.Button>
            <ToggleButtonGroup.Button value="50">50%</ToggleButtonGroup.Button>
            <ToggleButtonGroup.Button value="25">25%</ToggleButtonGroup.Button>
          </ToggleButtonGroup>
        </div>
        <div className="flex flex-col gap-5">
          <Typography variant="h3" weight={700} className="text-high-emphesis">
            {i18n._(t`Receive:`)}
          </Typography>
          <div className="flex flex-col gap-4">
            <ListPanel
              items={Object.values(parsedOutputAmounts).map((amount, index) => (
                <ListPanel.CurrencyAmountItem amount={amount} key={index} />
              ))}
            />
            <Button color="gradient" disabled={!percentageAmount} onClick={handleClick}>
              {percentageAmount ? i18n._(t`Confirm Withdrawal`) : i18n._(t`Tap amount or type amount to continue`)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassicUnzapMode
