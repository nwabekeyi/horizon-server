const BrokerFee = require('../models/brokersFeeModel');

exports.updateBrokerFee = async (req, res) => {
  try {
    const { fee } = req.body;

    if (typeof fee !== 'number' || fee < 0 || fee > 100) {
      return res.status(400).json({ error: 'Fee must be a number between 0 and 100.' });
    }

    // Fetch the only broker fee document
    const brokerFee = await BrokerFee.findOne();

    if (!brokerFee) {
      return res.status(404).json({ error: 'Broker fee not found. Please create it first.' });
    }

    brokerFee.fee = fee;
    await brokerFee.save();

    res.status(200).json({
      message: 'Broker fee updated successfully.',
      brokerFee,
    });
  } catch (error) {
    console.error('Error updating broker fee:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


exports.getBrokerFee = async (req, res) => {
    try {
      const brokerFee = await BrokerFee.findOne();

      if (!brokerFee) {
        return res.status(404).json({ error: 'Broker fee not set yet.' });
      }

      res.status(200).json({ brokerFee });
    } catch (error) {
      console.error('Error fetching broker fee:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };
