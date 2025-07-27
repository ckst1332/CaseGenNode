import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Calculator } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const ResultsEntry = ({ caseData, onResultsSubmit, isSubmitting = false }) => {
  const [userResults, setUserResults] = useState({
    npv: '',
    irr: ''
  });
  const [errors, setErrors] = useState({});

  const validateResults = () => {
    const newErrors = {};
    
    // Validate NPV
    const npvValue = parseFloat(userResults.npv);
    if (!userResults.npv || isNaN(npvValue)) {
      newErrors.npv = 'NPV is required and must be a valid number';
    } else if (npvValue < 0) {
      newErrors.npv = 'NPV should typically be positive for viable investments';
    }

    // Validate IRR
    const irrValue = parseFloat(userResults.irr);
    if (!userResults.irr || isNaN(irrValue)) {
      newErrors.irr = 'IRR is required and must be a valid number';
    } else if (irrValue < 0 || irrValue > 100) {
      newErrors.irr = 'IRR should be between 0% and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateResults()) {
      // Convert IRR from percentage to decimal for storage
      const resultsToSubmit = {
        npv: parseFloat(userResults.npv),
        irr: parseFloat(userResults.irr) / 100, // Convert percentage to decimal
        submitted_at: new Date().toISOString()
      };
      onResultsSubmit(resultsToSubmit);
    }
  };

  const handleInputChange = (field, value) => {
    setUserResults(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Submit Your DCF Model Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter the final NPV and IRR from your DCF model. Make sure to double-check your calculations!
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            {/* NPV Input */}
            <div className="space-y-2">
              <Label htmlFor="npv" className="text-sm font-medium">
                Net Present Value (NPV)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="npv"
                  type="text"
                  placeholder="e.g., 25000000"
                  value={userResults.npv}
                  onChange={(e) => handleInputChange('npv', e.target.value)}
                  className={`pl-8 ${errors.npv ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.npv && (
                <p className="text-sm text-red-600">{errors.npv}</p>
              )}
              <p className="text-xs text-gray-500">
                Enter the enterprise value from your DCF calculation
              </p>
            </div>

            {/* IRR Input */}
            <div className="space-y-2">
              <Label htmlFor="irr" className="text-sm font-medium">
                Internal Rate of Return (IRR)
              </Label>
              <div className="relative">
                <Input
                  id="irr"
                  type="text"
                  placeholder="e.g., 18.5"
                  value={userResults.irr}
                  onChange={(e) => handleInputChange('irr', e.target.value)}
                  className={`pr-8 ${errors.irr ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {errors.irr && (
                <p className="text-sm text-red-600">{errors.irr}</p>
              )}
              <p className="text-xs text-gray-500">
                Enter as percentage (e.g., 18.5 for 18.5%)
              </p>
            </div>
          </div>

          {/* Company Context */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Case Context:</h4>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Company:</strong> {caseData.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Starting ARR:</strong> ${formatNumber(caseData.starting_point?.current_arr)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>WACC:</strong> {((caseData.assumptions?.financial_assumptions?.wacc || 0) * 100).toFixed(1)}%
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Results...' : 'Submit Results & See Comparison'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResultsEntry;
