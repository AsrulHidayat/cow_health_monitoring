import React from "react";
import { Card, Table } from "flowbite-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const HistoryCardGerakan = ({ historyData, isLoading }) => {
  return (
    <Card className="h-full">
      <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white mb-4">
        Riwayat Data Gerakan
      </h5>
      {isLoading && <p>Memuat data...</p>}
      {!isLoading && historyData && historyData.length === 0 && (
        <p>Belum ada data gerakan.</p>
      )}
      {historyData && historyData.length > 0 && (
        <div className="overflow-x-auto h-96">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Waktu</Table.HeadCell>
              <Table.HeadCell>Accel X (m/s²)</Table.HeadCell>
              <Table.HeadCell>Accel Y (m/s²)</Table.HeadCell>
              <Table.HeadCell>Accel Z (m/s²)</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {historyData.map((data) => (
                <Table.Row
                  key={data.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell>
                    {format(parseISO(data.created_at), "dd/MM/yy HH:mm:ss", {
                      locale: id,
                    })}
                  </Table.Cell>
                  <Table.Cell>{data.accel_x.toFixed(2)}</Table.Cell>
                  <Table.Cell>{data.accel_y.toFixed(2)}</Table.Cell>
                  <Table.Cell>{data.accel_z.toFixed(2)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default HistoryCardGerakan;