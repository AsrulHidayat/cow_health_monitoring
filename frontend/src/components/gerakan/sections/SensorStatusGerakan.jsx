import React from "react";
import { Card, Badge } from "flowbite-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const SensorStatusGerakan = ({ statusData }) => {
  if (!statusData) {
    return (
      <Card>
        <div className="text-center text-gray-500">Memuat status sensor...</div>
      </Card>
    );
  }

  const { status, message, last_update } = statusData;
  const isOnline = status === "online";
  const lastUpdateDate = last_update ? parseISO(last_update) : null;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          Sensor Gerakan
        </h5>
        <Badge color={isOnline ? "success" : "failure"} size="sm">
          {status}
        </Badge>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  Status
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </li>
          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  Data Terakhir
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {lastUpdateDate
                    ? format(lastUpdateDate, "dd MMMM yyyy, HH:mm:ss", {
                        locale: id,
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default SensorStatusGerakan;