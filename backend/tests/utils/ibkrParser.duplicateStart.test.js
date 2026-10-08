// Regression: a broker sync re-downloads fills that are already imported. When the
// first fill in a symbol's window was a duplicate, the parser started a trade from
// it, skipped the fill, and kept the empty trade, so the next new fill inherited
// the old fill's date and side (a 10/07 COIN short was stored as an 08/20 long).
const { parseIBKRTransactions } = require('../../src/utils/csv/parsers/ibkr');

const fill = (dateTime, quantity, price, execId) => ({
  Symbol: 'COIN', Conid: '481691285', AssetClass: 'STK', DateTime: dateTime,
  Quantity: String(quantity), TradePrice: String(price), IBCommission: '-0.35', IBExecID: execId
});

const oldRoundTrip = [
  fill('2026-08-20;09:53:45', 24, 170.54, 'old-1'),
  fill('2026-08-20;09:54:07', -24, 169.72, 'old-2')
];
const newShort = [
  fill('2026-10-07;09:38:39', -25, 179.265, 'new-1'),
  fill('2026-10-07;09:38:39', -4, 179.265, 'new-2'),
  fill('2026-10-07;09:39:18', 15, 179.27, 'new-3'),
  fill('2026-10-07;09:39:18', 14, 179.2695, 'new-4')
];

describe('IBKR parser: duplicate fill at the start of a sync window', () => {
  beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterAll(() => console.log.mockRestore());

  test('new fills after an already-imported round trip start their own trade', async () => {
    const context = {
      existingExecutions: {
        conid_481691285: [
          { action: 'buy', quantity: 24, price: 170.54, datetime: '2026-08-20T09:53:45', execution_id: 'old-1' },
          { action: 'sell', quantity: 24, price: 169.72, datetime: '2026-08-20T09:54:07', execution_id: 'old-2' }
        ]
      }
    };

    const trades = await parseIBKRTransactions([...oldRoundTrip, ...newShort], {}, { enabled: false }, context);

    expect(trades).toHaveLength(1);
    expect(trades[0]).toMatchObject({ symbol: 'COIN', side: 'short', tradeDate: '2026-10-07', quantity: 29 });
    expect(trades[0].executions.map(e => e.execution_id)).toEqual(['new-1', 'new-2', 'new-3', 'new-4']);
    expect(trades[0].entryPrice).toBeCloseTo(179.265);
    expect(trades[0].exitPrice).toBeCloseTo(179.26976, 4);
  });

  test('a window with only already-imported fills creates no trades', async () => {
    const context = {
      existingExecutions: {
        conid_481691285: [
          { action: 'buy', quantity: 24, price: 170.54, datetime: '2026-08-20T09:53:45', execution_id: 'old-1' },
          { action: 'sell', quantity: 24, price: 169.72, datetime: '2026-08-20T09:54:07', execution_id: 'old-2' }
        ]
      }
    };

    const trades = await parseIBKRTransactions(oldRoundTrip, {}, { enabled: false }, context);

    expect(trades).toHaveLength(0);
  });
});
