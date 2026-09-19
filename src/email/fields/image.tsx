import type { CustomField } from "@puckeditor/core";
import { ImageField } from "@/components/fields/ImageField";

/**
 * Image source field: paste a URL or upload a local file. The control lives in a client
 * component because it needs hooks; this module stays importable from server code.
 */
export function imageField(label: string): CustomField<string> {
  return {
    type: "custom",
    label,
    render: (props) => <ImageField label={label} {...props} />,
  };
}
