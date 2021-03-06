const PublishPrices = require("../../scripts/PublishPrices.js");
const assertPackage = require("assert");
const identifiers = require("../../config/identifiers");
const identifiersTest = require("../../config/identifiersTest");

contract("scripts/PublishPrices.js", function(accounts) {
  const verifyAllConfigs = function(config) {
    for (const identifierConfig of Object.values(config)) {
      PublishPrices.verifyFeedConfig(identifierConfig.uploaderConfig);
    }
  };

  it("verifyFeedConfig", async function() {
    // Verify that the checked in configs are valid.
    verifyAllConfigs(identifiers);
    verifyAllConfigs(identifiersTest);

    const validConfig = {
      publishInterval: "900",
      minDelay: "0",
      numerator: {
        dataSource: "Coinbase",
        assetName: "BTC-USD"
      },
      denominator: {
        dataSource: "Coinbase",
        assetName: "ETH-USD"
      }
    };
    // A valid config doesn't throw any errors.
    PublishPrices.verifyFeedConfig(validConfig);

    // Any missing fields should throw errors.
    assertPackage.throws(() => PublishPrices.verifyFeedConfig({ ...validConfig, publishInterval: null }));
    assertPackage.throws(() => PublishPrices.verifyFeedConfig({ ...validConfig, minDelay: null }));
    assertPackage.throws(() =>
      PublishPrices.verifyFeedConfig({ ...validConfig, numerator: { ...validConfig.numerator, dataSource: null } })
    );
    assertPackage.throws(() =>
      PublishPrices.verifyFeedConfig({ ...validConfig, numerator: { ...validConfig.numerator, assetName: null } })
    );

    // Denominator isn't necessary: no errors.
    PublishPrices.verifyFeedConfig({ ...validConfig, denominator: null });
    // But if denominator is provided, both `dataSource` and `assetName` must exist.
    assertPackage.throws(() =>
      PublishPrices.verifyFeedConfig({ ...validConfig, denominator: { ...validConfig.denominator, dataSource: null } })
    );
    assertPackage.throws(() =>
      PublishPrices.verifyFeedConfig({ ...validConfig, denominator: { ...validConfig.denominator, assetName: null } })
    );
  });

  it("TestRun", async function() {
    const alphaVantageKey = process.env.ALPHAVANTAGE_API_KEY;
    const barchartStandardKey = process.env.BARCHART_API_KEY;
    const barchartEquitiesKey = process.env.BARCHART_EQUITIES_API_KEY;
    const cmcKey = process.env.CMC_PRO_API_KEY;

    if (cmcKey && barchartStandardKey && barchartEquitiesKey && alphaVantageKey) {
      console.log("All API keys are defined in the environment. Running runExport().");
      assert.isTrue(await PublishPrices.runExport());
    } else {
      console.log("Not running runExport() because all required API keys are not defined in the environment.");
    }
  });
});
