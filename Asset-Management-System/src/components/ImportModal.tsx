import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  sampleData: string;
  instructions: string[];
  expectedHeaders: string[];
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, sampleData, instructions, expectedHeaders }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileParse = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields;
        if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
          setError(`Invalid CSV structure. Please ensure the headers are: ${expectedHeaders.join(', ')}`)
          return;
        }
        setParsedData(results.data);
        setError(null);
      },
      error: (err) => {
        setError('Error parsing CSV file.');
      }
    });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleFileParse(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileParse(file);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    if (parsedData) {
      onImport(parsedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setParsedData(null);
    setError(null);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <div className="flex">
              <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4" /></div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        {!parsedData ? (
          <>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">CSV Structure Instructions:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {instructions.map((inst, index) => (
                  <li key={index}>{inst}</li>
                ))}
              </ul>
            </div>
            <div 
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-200 ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}>
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-semibold mb-2">Drag & drop your CSV file here</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <input type="file" id="csv-upload" className="hidden" onChange={handleFileSelect} accept=".csv" />
              <label htmlFor="csv-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Browse File
              </label>
            </div>
            <div className="mt-6 text-center">
              <Button 
                onClick={handleDownloadSample}
                variant="outline"
                className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>
          </>
        ) : (
          <div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">File Ready for Import</h3>
              <p className="text-lg">Found <span className="font-bold">{parsedData.length}</span> items to import.</p>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirmImport}>
                Confirm Import
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;